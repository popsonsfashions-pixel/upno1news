"""API Routers."""
from app.routers.auth import router as auth_router
from app.routers.articles import router as articles_router
from app.routers.users import router as users_router

__all__ = ["auth_router", "articles_router", "users_router"]
