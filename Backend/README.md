# SAKSHI Backend

AI-Powered Legal Intelligence Platform — FastAPI Backend

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | FastAPI 0.115 |
| Language | Python 3.12+ |
| ORM | SQLAlchemy 2.0 (Async) |
| Database | PostgreSQL 16 (Supabase Compatible) |
| Migrations | Alembic |
| Validation | Pydantic v2 |
| Auth | JWT (python-jose) + bcrypt (passlib) |
| Async Driver | AsyncPG |
| Server | Uvicorn |
| Logging | Loguru |
| AI | Google Gemini API |

---

## Project Structure

```
sakshi-backend/
├── app/
│   ├── api/v1/            # All versioned API routers
│   │   ├── auth/
│   │   ├── users/
│   │   ├── cases/
│   │   ├── evidence/
│   │   ├── workflow/
│   │   ├── analytics/
│   │   ├── reports/
│   │   ├── notifications/
│   │   ├── audit/
│   │   ├── ai/
│   │   ├── risk/
│   │   ├── readiness/
│   │   └── public/
│   ├── core/              # Config, DB, Security, Auth, Logging
│   ├── models/            # SQLAlchemy ORM models
│   ├── schemas/           # Pydantic v2 request/response schemas
│   ├── services/          # Business logic layer
│   ├── repositories/      # Data access layer
│   ├── dependencies/      # FastAPI Depends() callables
│   ├── middleware/        # Custom Starlette middleware
│   ├── utils/             # Shared utilities
│   ├── tests/             # Test suite
│   └── main.py            # Application factory
├── alembic/               # Database migrations
├── scripts/               # Utility scripts
├── requirements.txt
├── .env                   # Local environment (git-ignored)
├── .env.example           # Environment template
├── Dockerfile
├── docker-compose.yml
└── run.py                 # Development entry point
```

---

## Quick Start

### 1. Create and activate virtual environment

```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# Linux/macOS
source .venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env with your database credentials and secret keys
```

### 4. Run the development server

```bash
python run.py
```

Server starts at: http://127.0.0.1:8000

### 5. Open API docs

- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/` | Root — returns `{"message": "SAKSHI Backend Running"}` |
| GET | `/health` | Health check — returns `{"status": "healthy"}` |
| GET | `/api/v1/public/ping` | Connectivity ping |
| GET | `/api/v1/public/status` | API operational status |

---

## Docker

```bash
# Start all services (API + PostgreSQL)
docker-compose up --build

# With pgAdmin
docker-compose --profile tools up --build
```

---

## Database Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback one step
alembic downgrade -1
```

---

## Environment Variables

See `.env.example` for all available configuration options.

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL async connection string |
| `SECRET_KEY` | Application secret key |
| `JWT_SECRET` | JWT signing secret |
| `JWT_ALGORITHM` | JWT algorithm (default: HS256) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token lifetime |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_KEY` | Supabase anon key |
| `GEMINI_API_KEY` | Google Gemini API key |
