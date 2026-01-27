"""Firebase Admin SDK initialization and Firestore client."""
import firebase_admin
from firebase_admin import credentials, firestore, auth
from functools import lru_cache

from backend_api.config import get_settings

settings = get_settings()

# Initialize Firebase Admin SDK
_firebase_app = None


def initialize_firebase():
    """Initialize Firebase Admin SDK with service account credentials."""
    global _firebase_app
    
    if _firebase_app is not None:
        return _firebase_app
    
    try:
        # Check for environment variable with JSON content first (Production)
        import os
        import json
        import base64
        
        firebase_creds_b64 = os.environ.get("FIREBASE_CREDENTIALS_BASE64")
        firebase_creds_json = os.environ.get("FIREBASE_CREDENTIALS_JSON")
        
        if firebase_creds_b64:
            print("Using FIREBASE_CREDENTIALS_BASE64 from environment")
            # Decode base64 to bytes, then to string
            creds_str = base64.b64decode(firebase_creds_b64).decode('utf-8')
            cred_dict = json.loads(creds_str)
            cred = credentials.Certificate(cred_dict)
        elif firebase_creds_json:
            print("Using FIREBASE_CREDENTIALS_JSON from environment")
            cred_dict = json.loads(firebase_creds_json)
            cred = credentials.Certificate(cred_dict)
        else:
            # Fallback to file path (Local Dev)
            print(f"Using settings path: {settings.firebase_credentials_path}")
            cred = credentials.Certificate(settings.firebase_credentials_path)
            
        _firebase_app = firebase_admin.initialize_app(cred)
        print("✅ Firebase initialized successfully")
        return _firebase_app
    except Exception as e:
        print(f"❌ Firebase initialization failed: {e}")
        # Print more details for debugging
        import traceback
        traceback.print_exc()
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
