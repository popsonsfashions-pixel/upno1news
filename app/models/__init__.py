"""SQLAlchemy Models - Now using Pydantic for Firestore."""
from app.models.user import (
    Role, 
    UserBase, 
    UserCreate, 
    UserUpdate, 
    UserInDB, 
    UserResponse,
    user_from_doc,
    user_to_response
)
from app.models.article import (
    ArticleBase,
    ArticleCreate,
    ArticleUpdate,
    ArticleInDB,
    ArticleResponse,
    article_from_doc,
    article_to_response
)

__all__ = [
    "Role",
    "UserBase", "UserCreate", "UserUpdate", "UserInDB", "UserResponse",
    "user_from_doc", "user_to_response",
    "ArticleBase", "ArticleCreate", "ArticleUpdate", "ArticleInDB", "ArticleResponse",
    "article_from_doc", "article_to_response",
]
