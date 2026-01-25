"""Role-based access control dependencies for Firebase/Firestore."""
from typing import Annotated, List

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.firebase_config import get_db, FirestoreDB
from app.models.user import Role, UserInDB
from app.services.auth import AuthService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[FirestoreDB, Depends(get_db)],
) -> UserInDB:
    """Get the current authenticated user from JWT token (Firebase or Local)."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    user_id = None
    
    # 1. Try to verify as Firebase ID Token
    firebase_payload = AuthService.verify_firebase_token(token)
    if firebase_payload:
        user_id = firebase_payload.get("uid")
    
    # 2. If not a Firebase token, try as local JWT
    if not user_id:
        local_payload = AuthService.decode_token(token)
        if local_payload:
            user_id = local_payload.get("sub")
            
    if not user_id:
        raise credentials_exception
    
    user = await AuthService.get_user_by_id(db, user_id)
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )
    
    return user


def require_roles(allowed_roles: List[Role]):
    """Dependency factory that restricts access to specific roles."""
    async def role_checker(
        current_user: Annotated[UserInDB, Depends(get_current_user)]
    ) -> UserInDB:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {[r.value for r in allowed_roles]}",
            )
        return current_user
    return role_checker


# Convenience dependency for admin-only endpoints
admin_only = require_roles([Role.ADMIN])

# Convenience dependency for reporters and admins
reporter_or_admin = require_roles([Role.ADMIN, Role.REPORTER])
