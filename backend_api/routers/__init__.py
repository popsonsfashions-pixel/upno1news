"""API Routers."""
from backend_api.routers.auth import router as auth_router
from backend_api.routers.articles import router as articles_router
from backend_api.routers.users import router as users_router

__all__ = ["auth_router", "articles_router", "users_router"]
