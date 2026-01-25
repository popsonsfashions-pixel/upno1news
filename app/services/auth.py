"""Authentication service for JWT and password handling with Firestore."""
from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import get_settings
from app.firebase_config import get_db, FirestoreDB, get_firebase_auth
import pyotp
import qrcode
import io
import base64
from app.models.user import Role, UserInDB, user_from_doc

settings = get_settings()

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    """Authentication service for Firebase/Firestore."""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password."""
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def create_access_token(
        data: dict, 
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """Create a JWT access token."""
        to_encode = data.copy()
        expire = datetime.utcnow() + (
            expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
        )
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    
    @staticmethod
    def decode_token(token: str) -> Optional[dict]:
        """Decode and validate a JWT token."""
        try:
            payload = jwt.decode(
                token, 
                settings.secret_key, 
                algorithms=[settings.algorithm]
            )
            return payload
        except JWTError:
            return None

    @staticmethod
    def verify_firebase_token(token: str) -> Optional[dict]:
        """Verify Firebase ID Token."""
        try:
            auth_client = get_firebase_auth()
            decoded_token = auth_client.verify_id_token(token)
            return decoded_token
        except Exception as e:
            print(f"Token verification failed: {e}")
            return None
    
    @staticmethod
    async def authenticate_user(
        db: FirestoreDB, 
        email: str, 
        password: str
    ) -> Optional[UserInDB]:
        """Authenticate a user by email and password."""
        user = await AuthService.get_user_by_email(db, email)
        
        if not user:
            return None
        if not AuthService.verify_password(password, user.hashed_password):
            return None
        
        return user
    
    @staticmethod
    async def get_user_by_email(db: FirestoreDB, email: str) -> Optional[UserInDB]:
        """Get a user by email from Firestore."""
        docs = db.users.where("email", "==", email).limit(1).stream()
        
        for doc in docs:
            return user_from_doc(doc)
        
        return None
    
    @staticmethod
    async def get_user_by_id(db: FirestoreDB, user_id: str) -> Optional[UserInDB]:
        """Get a user by ID from Firestore."""
        doc = db.users.document(user_id).get()
        return user_from_doc(doc)
    
    @staticmethod
    async def create_user(
        db: FirestoreDB,
        email: str,
        hashed_password: str,
        full_name: Optional[str] = None,
        role: Role = Role.READER
    ) -> UserInDB:
        """Create a new user in Firestore."""
        user_data = {
            "email": email,
            "hashed_password": hashed_password,
            "full_name": full_name,
            "role": role.value,
            "is_active": True,
            "two_factor_enabled": False,
            "created_at": datetime.utcnow()
        }
        
        # Add to Firestore
        doc_ref = db.users.document()
        doc_ref.set(user_data)
        
        # Return the created user
        user_data["id"] = doc_ref.id
        user_data["role"] = role
        return UserInDB(**user_data)

    @staticmethod
    def generate_2fa_secret() -> str:
        """Generate a random base32 2FA secret."""
        return pyotp.random_base32()
    
    @staticmethod
    def get_2fa_qr_code(email: str, secret: str) -> str:
        """Generate a QR code containing user email and secret key."""
        totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
            name=email,
            issuer_name="UP News No.1"
        )
        
        # Create QR code image
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(totp_uri)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        return base64.b64encode(buffered.getvalue()).decode("utf-8")
    
    @staticmethod
    async def enable_2fa(db: FirestoreDB, user_id: str, secret: str) -> bool:
        """Enable 2FA for a user and save the secret."""
        try:
            db.users.document(user_id).update({
                "two_factor_secret": secret,
                "two_factor_enabled": True
            })
            return True
        except Exception as e:
            print(f"Error enabling 2FA: {e}")
            return False

    @staticmethod
    async def verify_2fa_code(db: FirestoreDB, user_id: str, code: str) -> bool:
        """Verify the 2FA code provided by the user."""
        user = await AuthService.get_user_by_id(db, user_id)
        if not user or not user.two_factor_enabled or not user.two_factor_secret:
            return False
            
        totp = pyotp.TOTP(user.two_factor_secret)
        return totp.verify(code)
