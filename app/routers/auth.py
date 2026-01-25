"""Authentication router for Firebase/Firestore."""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
import pyotp

from app.firebase_config import get_db, FirestoreDB
from app.models.user import UserCreate, UserResponse, user_to_response, UserInDB
from app.services.auth import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    db: Annotated[FirestoreDB, Depends(get_db)],
):
    """Register a new user."""
    # Check if email already exists
    existing_user = await AuthService.get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Create new user in Firestore
    user = await AuthService.create_user(
        db=db,
        email=user_data.email,
        hashed_password=AuthService.hash_password(user_data.password),
        full_name=user_data.full_name,
        role=user_data.role
    )
    
    return user_to_response(user)


@router.post("/login")
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[FirestoreDB, Depends(get_db)],
):
    """Login and get access token."""
    user = await AuthService.authenticate_user(db, form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )
    
    # Check if 2FA is enabled
    # TEMPORARILY DISABLED - uncomment to re-enable 2FA
    # if user.two_factor_enabled:
    #     # Create a temporary token for 2FA verification (short expiry)
    #     temp_token = AuthService.create_access_token(
    #         data={
    #             "sub": user.id,
    #             "email": user.email,
    #             "role": user.role.value,
    #             "requires_2fa": True
    #         },
    #         expires_delta=timedelta(minutes=5)  # Short-lived for 2FA step
    #     )
    #     return {
    #         "access_token": temp_token, 
    #         "token_type": "bearer", 
    #         "requires_2fa": True,
    #         "two_factor_enabled": True
    #     }
    
    # No 2FA required, issue full token
    access_token = AuthService.create_access_token(
        data={
            "sub": user.id,
            "email": user.email,
            "role": user.role.value,
        }
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "requires_2fa": False,
        "two_factor_enabled": False
    }


from datetime import timedelta
from app.schemas.user import Setup2FAResponse, Verify2FARequest
from app.dependencies.permissions import get_current_user

@router.post("/2fa/setup", response_model=Setup2FAResponse)
async def setup_2fa(
    current_user: Annotated[UserInDB, Depends(get_current_user)],
    db: Annotated[FirestoreDB, Depends(get_db)],
):
    """Generate a new 2FA secret and QR code for the user."""
    secret = AuthService.generate_2fa_secret()
    qr_code = AuthService.get_2fa_qr_code(current_user.email, secret)
    
    # Save secret but don't enable yet
    db.users.document(current_user.id).update({
        "two_factor_secret": secret,
        "two_factor_enabled": False
    })
    
    return Setup2FAResponse(secret=secret, qr_code=qr_code)


@router.post("/2fa/enable")
async def enable_2fa(
    request: Verify2FARequest,
    current_user: Annotated[UserInDB, Depends(get_current_user)],
    db: Annotated[FirestoreDB, Depends(get_db)],
):
    """Verify code and enable 2FA."""
    # We need to temporarily fetch the secret we just saved
    user_doc = db.users.document(current_user.id).get()
    secret = user_doc.to_dict().get("two_factor_secret")
    
    if not secret:
        raise HTTPException(status_code=400, detail="2FA setup not started")
        
    totp = pyotp.TOTP(secret)
    if not totp.verify(request.code):
        raise HTTPException(status_code=400, detail="Invalid 2FA code")
        
    # Enable 2FA
    await AuthService.enable_2fa(db, current_user.id, secret)
    return {"message": "2FA enabled successfully"}


@router.post("/2fa/verify")
async def verify_2fa(
    request: Verify2FARequest,
    current_user: Annotated[UserInDB, Depends(get_current_user)],
    db: Annotated[FirestoreDB, Depends(get_db)],
):
    """Verify 2FA code and issue full access token."""
    is_valid = await AuthService.verify_2fa_code(db, current_user.id, request.code)
    
    if not is_valid:
        raise HTTPException(status_code=401, detail="Invalid 2FA code")
    
    # Issue a new full access token without the requires_2fa flag
    access_token = AuthService.create_access_token(
        data={
            "sub": current_user.id,
            "email": current_user.email,
            "role": current_user.role.value,
        }
    )
        
    return {
        "valid": True,
        "access_token": access_token,
        "token_type": "bearer"
    }

