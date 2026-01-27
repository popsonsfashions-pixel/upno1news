"""User model for Firestore."""
import enum
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


class Role(str, enum.Enum):
    """User roles for access control."""
    ADMIN = "admin"
    REPORTER = "reporter"
    READER = "reader"


class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    full_name: Optional[str] = None
    profile_picture: Optional[str] = None


class UserCreate(UserBase):
    """Schema for creating a new user."""
    password: str
    role: Role = Role.READER


class UserUpdate(BaseModel):
    """Schema for updating a user."""
    full_name: Optional[str] = None
    role: Optional[Role] = None
    is_active: Optional[bool] = None


class UserInDB(UserBase):
    """User as stored in Firestore."""
    id: str
    hashed_password: str
    role: Role = Role.READER
    is_active: bool = True
    profile_picture: Optional[str] = None
    two_factor_secret: Optional[str] = None
    two_factor_enabled: bool = False
    created_at: datetime = None
    
    class Config:
        from_attributes = True


class UserResponse(UserBase):
    """User response schema."""
    id: str
    role: Role
    is_active: bool
    two_factor_enabled: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


def user_from_doc(doc) -> Optional[UserInDB]:
    """Convert Firestore document to UserInDB model."""
    if not doc.exists:
        return None
    
    data = doc.to_dict()
    data['id'] = doc.id
    
    # Handle timestamp conversion
    if 'created_at' in data and hasattr(data['created_at'], 'isoformat'):
        pass  # Already a datetime-like object
    elif 'created_at' not in data:
        data['created_at'] = datetime.utcnow()
    
    # Handle role enum
    if isinstance(data.get('role'), str):
        data['role'] = Role(data['role'])
    
    return UserInDB(**data)


def user_to_response(user: UserInDB) -> UserResponse:
    """Convert UserInDB to UserResponse."""
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        profile_picture=user.profile_picture,
        role=user.role,
        is_active=user.is_active,
        two_factor_enabled=user.two_factor_enabled,
        created_at=user.created_at
    )
