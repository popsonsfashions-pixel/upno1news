"""Users management router for Firebase/Firestore."""
from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, status

from app.firebase_config import get_db, FirestoreDB
from app.models.user import Role, UserInDB, UserResponse, UserUpdate, user_from_doc, user_to_response
from app.dependencies.permissions import get_current_user, require_roles

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: Annotated[UserInDB, Depends(get_current_user)],
):
    """Get current user information."""
    return user_to_response(current_user)


@router.get("/", response_model=List[UserResponse])
async def list_users(
    db: Annotated[FirestoreDB, Depends(get_db)],
    current_user: Annotated[UserInDB, Depends(require_roles([Role.ADMIN]))],
):
    """List all users (Admin only)."""
    docs = db.users.stream()
    users = []
    
    for doc in docs:
        user = user_from_doc(doc)
        if user:
            users.append(user_to_response(user))
    
    return users


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    db: Annotated[FirestoreDB, Depends(get_db)],
    current_user: Annotated[UserInDB, Depends(require_roles([Role.ADMIN]))],
):
    """Update a user (Admin only)."""
    doc_ref = db.users.document(user_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Prepare update data
    update_data = user_data.model_dump(exclude_unset=True)
    
    # Convert role enum to string for Firestore
    if 'role' in update_data and update_data['role']:
        update_data['role'] = update_data['role'].value
    
    # Update in Firestore
    doc_ref.update(update_data)
    
    # Get updated document
    updated_doc = doc_ref.get()
    user = user_from_doc(updated_doc)
    
    return user_to_response(user)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    db: Annotated[FirestoreDB, Depends(get_db)],
    current_user: Annotated[UserInDB, Depends(require_roles([Role.ADMIN]))],
):
    """Delete a user (Admin only)."""
    doc_ref = db.users.document(user_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself",
        )
    
    doc_ref.delete()
