"""Firebase Admin SDK initialization and Firestore client."""
import firebase_admin
from firebase_admin import credentials, firestore, auth
from functools import lru_cache

from app.config import get_settings

settings = get_settings()

# Initialize Firebase Admin SDK
_firebase_app = None


def initialize_firebase():
    """Initialize Firebase Admin SDK with service account credentials."""
    global _firebase_app
    
    if _firebase_app is not None:
        return _firebase_app
    
    try:
        cred = credentials.Certificate(settings.firebase_credentials_path)
        _firebase_app = firebase_admin.initialize_app(cred)
        print("✅ Firebase initialized successfully")
        return _firebase_app
    except Exception as e:
        print(f"❌ Firebase initialization failed: {e}")
        raise


@lru_cache
def get_firestore_client():
    """Get Firestore client instance."""
    initialize_firebase()
    return firestore.client()


def get_firebase_auth():
    """Get Firebase Auth module."""
    initialize_firebase()
    return auth


# Collection names
USERS_COLLECTION = "users"
ARTICLES_COLLECTION = "articles"


class FirestoreDB:
    """Firestore database helper class."""
    
    def __init__(self):
        self.db = get_firestore_client()
    
    # Users collection
    @property
    def users(self):
        return self.db.collection(USERS_COLLECTION)
    
    # Articles collection
    @property
    def articles(self):
        return self.db.collection(ARTICLES_COLLECTION)


def get_db() -> FirestoreDB:
    """Dependency to get Firestore database instance."""
    return FirestoreDB()
