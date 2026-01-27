"""Dependencies package."""
from backend_api.dependencies.permissions import get_current_user, require_roles, admin_only

__all__ = ["get_current_user", "require_roles", "admin_only"]
