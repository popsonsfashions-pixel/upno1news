"""Article model for Firestore."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class ArticleBase(BaseModel):
    """Base article schema."""
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)


class ArticleCreate(ArticleBase):
    """Schema for creating an article."""
    pass


class ArticleUpdate(BaseModel):
    """Schema for updating an article."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = Field(None, min_length=1)


class ArticleInDB(ArticleBase):
    """Article as stored in Firestore."""
    id: str
    is_published: bool = False
    author_id: str
    author_email: str = ""
    created_at: datetime = None
    updated_at: datetime = None

    class Config:
        from_attributes = True


class ArticleResponse(ArticleBase):
    """Article response schema."""
    id: str
    is_published: bool
    author_id: str
    author_email: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


def article_from_doc(doc) -> Optional[ArticleInDB]:
    """Convert Firestore document to ArticleInDB model."""
    if not doc.exists:
        return None
    
    data = doc.to_dict()
    data['id'] = doc.id
    
    # Handle timestamp conversion
    now = datetime.utcnow()
    if 'created_at' not in data or data['created_at'] is None:
        data['created_at'] = now
    if 'updated_at' not in data or data['updated_at'] is None:
        data['updated_at'] = now
    
    return ArticleInDB(**data)


def article_to_response(article: ArticleInDB) -> ArticleResponse:
    """Convert ArticleInDB to ArticleResponse."""
    return ArticleResponse(
        id=article.id,
        title=article.title,
        content=article.content,
        is_published=article.is_published,
        author_id=article.author_id,
        author_email=article.author_email,
        created_at=article.created_at,
        updated_at=article.updated_at
    )
