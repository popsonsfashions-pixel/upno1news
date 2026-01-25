# FastAPI Boilerplate with PostgreSQL & Role-Based Access Control

A production-ready FastAPI backend with PostgreSQL database, SQLAlchemy ORM, and role-based access control for Articles management.

## Features

- 🚀 **FastAPI** - Modern, fast web framework
- 🐘 **PostgreSQL** - Robust database with async support
- 🔐 **JWT Authentication** - Secure token-based auth
- 👥 **Role-Based Access Control** - Admin, Reporter, Reader roles
- 📝 **Articles CRUD** - Full article management
- 🔒 **Admin-Only Publish** - Secured publish endpoint
- 📊 **Alembic Migrations** - Database version control
- 📖 **Auto-generated Docs** - Swagger UI & ReDoc

## User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full CRUD + Publish articles + Manage users |
| **Reporter** | Create, Read, Update own articles (no publish) |
| **Reader** | Read published articles only |

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update with your PostgreSQL credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL=postgresql+asyncpg://username:password@localhost:5432/your_database
SECRET_KEY=your-super-secret-key-change-in-production
```

### 3. Create Database

Make sure PostgreSQL is running from the command line and run:

```sql
CREATE DATABASE your_database;
```

### 4. Run Migrations (Optional)

```bash
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

Or let the app create tables automatically on startup.

### 5. Start the Server

```bash
uvicorn app.main:app --reload
```

### 6. Access API Documentation

- **Swagger UI**: http://127.0.0.1:8000/docs
- **ReDoc**: http://127.0.0.1:8000/redoc

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and get JWT token |

### Users (Admin Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/me` | Get current user info |
| GET | `/users/` | List all users |
| PATCH | `/users/{id}` | Update a user |
| DELETE | `/users/{id}` | Delete a user |

### Articles
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/articles/` | All authenticated | List articles |
| GET | `/articles/{id}` | All authenticated | Get article |
| POST | `/articles/` | Reporter, Admin | Create article |
| PUT | `/articles/{id}` | Owner, Admin | Update article |
| DELETE | `/articles/{id}` | Admin only | Delete article |
| POST | `/articles/{id}/publish` | **Admin only** | Publish article |
| POST | `/articles/{id}/unpublish` | Admin only | Unpublish article |

## Project Structure

```
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration settings
│   ├── database.py          # Database connection
│   ├── models/              # SQLAlchemy models
│   │   ├── user.py          # User & Role
│   │   └── article.py       # Article
│   ├── schemas/             # Pydantic schemas
│   │   ├── user.py
│   │   └── article.py
│   ├── routers/             # API endpoints
│   │   ├── auth.py
│   │   ├── users.py
│   │   └── articles.py
│   ├── services/            # Business logic
│   │   └── auth.py
│   └── dependencies/        # FastAPI dependencies
│       └── permissions.py   # Role-based access
├── alembic/                 # Database migrations
├── alembic.ini
├── requirements.txt
├── .env.example
└── README.md
```

## Usage Example

### 1. Register an Admin User

```bash
curl -X POST "http://127.0.0.1:8000/auth/register" \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@example.com", "password": "adminpass123", "role": "admin"}'
```

### 2. Login

```bash
curl -X POST "http://127.0.0.1:8000/auth/login" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=admin@example.com&password=adminpass123"
```

### 3. Create an Article (with token)

```bash
curl -X POST "http://127.0.0.1:8000/articles/" \
     -H "Authorization: Bearer <your_token>" \
     -H "Content-Type: application/json" \
     -d '{"title": "My First Article", "content": "This is the content."}'
```

### 4. Publish Article (Admin Only)

```bash
curl -X POST "http://127.0.0.1:8000/articles/1/publish" \
     -H "Authorization: Bearer <admin_token>"
```

## License

MIT License
