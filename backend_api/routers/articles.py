"""Articles CRUD router with role-based access control for Firebase/Firestore."""
from datetime import datetime
from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, status

from backend_api.firebase_config import get_db, FirestoreDB
from backend_api.models.user import Role, UserInDB
from backend_api.models.article import (
    ArticleCreate, ArticleResponse, ArticleUpdate,
    article_from_doc, article_to_response
)
from backend_api.dependencies.permissions import get_current_user, require_roles

router = APIRouter(prefix="/articles", tags=["Articles"])


@router.get("/", response_model=List[ArticleResponse])
async def list_articles(
    db: Annotated[FirestoreDB, Depends(get_db)],
    current_user: Annotated[UserInDB, Depends(get_current_user)],
    q: str = None,
):
    """
    List articles.
    - Readers: Only published articles
    - Reporters: Own articles + published articles
    - Admins: All articles
    - q: Optional search query (filters by title/content)
    """
    articles = []
    
    if current_user.role == Role.ADMIN:
        # Admins see all articles
        docs = db.articles.stream()
    elif current_user.role == Role.REPORTER:
        # Reporters see published + their own
        # Firestore doesn't support OR queries easily, so we fetch separately
        published_docs = list(db.articles.where("is_published", "==", True).stream())
        own_docs = list(db.articles.where("author_id", "==", current_user.id).stream())
        
        # Combine and deduplicate
        seen_ids = set()
        docs = []
        for doc in published_docs + own_docs:
            if doc.id not in seen_ids:
                seen_ids.add(doc.id)
                docs.append(doc)
    else:  # READER
        docs = db.articles.where("is_published", "==", True).stream()
    
    for doc in docs:
        article = article_from_doc(doc)
        if article:
            # Filter by query if provided
            if q:
                query = q.lower()
                if query not in article.title.lower() and query not in article.content.lower():
                    continue
            articles.append(article_to_response(article))
    
    return articles


@router.get("/{article_id}", response_model=ArticleResponse)
async def get_article(
    article_id: str,
    db: Annotated[FirestoreDB, Depends(get_db)],
    current_user: Annotated[UserInDB, Depends(get_current_user)],
):
    """Get a specific article."""
    doc = db.articles.document(article_id).get()
    article = article_from_doc(doc)
    
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found",
        )
    
    # Check access permissions
    if current_user.role == Role.READER and not article.is_published:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to unpublished article",
        )
    
    if current_user.role == Role.REPORTER:
        if not article.is_published and article.author_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to unpublished article",
            )
    
    return article_to_response(article)


@router.post("/", response_model=ArticleResponse, status_code=status.HTTP_201_CREATED)
async def create_article(
    article_data: ArticleCreate,
    db: Annotated[FirestoreDB, Depends(get_db)],
    current_user: Annotated[UserInDB, Depends(require_roles([Role.ADMIN, Role.REPORTER]))],
):
    """Create a new article (Admin, Reporter only)."""
    now = datetime.utcnow()
    
    article_dict = {
        "title": article_data.title,
        "content": article_data.content,
        "is_published": False,
        "author_id": current_user.id,
        "author_email": current_user.email,
        "created_at": now,
        "updated_at": now,
    }
    
    # Add to Firestore
    doc_ref = db.articles.document()
    doc_ref.set(article_dict)
    
    # Get the created document
    doc = doc_ref.get()
    article = article_from_doc(doc)
    
    return article_to_response(article)


@router.put("/{article_id}", response_model=ArticleResponse)
async def update_article(
    article_id: str,
    article_data: ArticleUpdate,
    db: Annotated[FirestoreDB, Depends(get_db)],
    current_user: Annotated[UserInDB, Depends(require_roles([Role.ADMIN, Role.REPORTER]))],
):
    """
    Update an article.
    - Reporters: Can only update their own articles
    - Admins: Can update any article
    """
    doc_ref = db.articles.document(article_id)
    doc = doc_ref.get()
    article = article_from_doc(doc)
    
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found",
        )
    
    # Check ownership for reporters
    if current_user.role == Role.REPORTER and article.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own articles",
        )
    
    # Prepare update data
    update_data = article_data.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    # Update in Firestore
    doc_ref.update(update_data)
    
    # Get updated document
    updated_doc = doc_ref.get()
    updated_article = article_from_doc(updated_doc)
    
    return article_to_response(updated_article)


@router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_article(
    article_id: str,
    db: Annotated[FirestoreDB, Depends(get_db)],
    current_user: Annotated[UserInDB, Depends(require_roles([Role.ADMIN]))],
):
    """Delete an article (Admin only)."""
    doc_ref = db.articles.document(article_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found",
        )
    
    doc_ref.delete()


@router.post("/{article_id}/publish", response_model=ArticleResponse)
async def publish_article(
    article_id: str,
    db: Annotated[FirestoreDB, Depends(get_db)],
    current_user: Annotated[UserInDB, Depends(require_roles([Role.ADMIN]))],
):
    """
    Publish an article (Admin only).
    
    This endpoint is restricted to Admin users only.
    Reporters and Readers cannot publish articles.
    """
    doc_ref = db.articles.document(article_id)
    doc = doc_ref.get()
    article = article_from_doc(doc)
    
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found",
        )
    
    if article.is_published:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Article is already published",
        )
    
    # Update to published
    doc_ref.update({
        "is_published": True,
        "updated_at": datetime.utcnow()
    })
    
    # Get updated document
    updated_doc = doc_ref.get()
    updated_article = article_from_doc(updated_doc)
    
    return article_to_response(updated_article)


@router.post("/{article_id}/unpublish", response_model=ArticleResponse)
async def unpublish_article(
    article_id: str,
    db: Annotated[FirestoreDB, Depends(get_db)],
    current_user: Annotated[UserInDB, Depends(require_roles([Role.ADMIN]))],
):
    """Unpublish an article (Admin only)."""
    doc_ref = db.articles.document(article_id)
    doc = doc_ref.get()
    article = article_from_doc(doc)
    
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found",
        )
    
    if not article.is_published:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Article is not published",
        )
    
    # Update to unpublished
    doc_ref.update({
        "is_published": False,
        "updated_at": datetime.utcnow()
    })
    
    # Get updated document
    updated_doc = doc_ref.get()
    updated_article = article_from_doc(updated_doc)
    
    return article_to_response(updated_article)
