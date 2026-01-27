"""FastAPI Application Entry Point with Firebase."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend_api.config import get_settings
from backend_api.firebase_config import initialize_firebase
from backend_api.routers import auth_router, articles_router, users_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup: Initialize Firebase
    initialize_firebase()
    yield
    # Shutdown: cleanup if needed


# Check if running on Vercel
import os
is_vercel = os.environ.get("VERCEL") == "1"

app = FastAPI(
    title=settings.app_name,
    description="""
## FastAPI + Firebase Boilerplate with Role-Based Access Control

A production-ready FastAPI backend with **Firebase Firestore** database
and role-based access control for Articles management.

### User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full CRUD + Publish articles + Manage users |
| **Reporter** | Create, Read, Update own articles (no publish) |
| **Reader** | Read published articles only |

### Authentication

Use the `/auth/register` endpoint to create a user, then `/auth/login` to get a JWT token.
Include the token in the `Authorization: Bearer <token>` header for protected endpoints.

### Database

Using **Firebase Firestore** for data storage with collections:
- `users` - User accounts with roles
- `articles` - News articles with publish status
    """,
    version="2.0.0",
    lifespan=lifespan,
    root_path="/api" if is_vercel else "",
    docs_url="/docs",
    openapi_url="/openapi.json",
    redoc_url=None
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(articles_router)


@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": "2.0.0",
        "database": "Firebase Firestore",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "database": "Firebase Firestore",
        "project": "upno1news-d584b",
    }
