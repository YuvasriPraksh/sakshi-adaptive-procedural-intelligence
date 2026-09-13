# Phase 2A Database Report

## 1. Database architecture
The database layer is designed for PostgreSQL using the `asyncpg` driver in SQLAlchemy 2.0. It leverages an async declarative base and `async_sessionmaker` for non-blocking I/O in the FastAPI application.

## 2. Existing models reviewed
The existing models (`Case`, `Workflow`, `WorkflowHistory`, `EvidenceItem`, `AuditLog`, etc.) provide a robust starting schema. Primary and foreign keys are defined. PostgreSQL-specific types (`UUID`, `JSONB`) are utilized for unique identifiers and unstructured metadata lists, respectively. No models were prematurely created for future phases (like `Dependency`, `Obligation`).

## 3. Alembic status
Alembic configuration is structurally complete:
- The `alembic/env.py` script was updated to ensure all models are imported at the top level via `import app.models`, which guarantees that `Base.metadata` correctly identifies all tables for `--autogenerate`.
- `alembic.ini` is correctly mapped to the `Backend` directory.

## 4. Migration created
**BLOCKED**. The `alembic revision --autogenerate` command requires a live connection to a PostgreSQL database to inspect the schema. Because Docker is not available in the current environment and no local `psql` instance was found, the initial migration file could not be safely generated at runtime.

## 5. Seed implementation
A robust seed script (`scripts/seed_db.py`) was created. It uses the async SQLAlchemy session to:
- Check for existing records to prevent duplication.
- Create core system Roles (`admin`, `police`, `hospital`, `fsl`, `cwc`, `supervisor`).
- Seed mock Users assigned to those roles with placeholder passwords.
- Create a synthetic POCSO case (`POCSO-2026-001`) with dummy timeline/workflow states (e.g., FIR Registered, Case Intake, Medical Examination, Evidence Collection).

## 6. Seed data created
**BLOCKED**. While the script is complete and ready, it cannot execute due to the missing PostgreSQL runtime.

## 7. Database health check
The `/health` endpoint in `app/main.py` was updated. It now actively queries the database (`SELECT 1`) to distinguish between the application running and the database being reachable, avoiding false-positive health statuses.

## 8. Tests performed
Created `scripts/test_db.py` to test asynchronous database connectivity and query the seeded case data.
Execution resulted in an expected failure because the required Python dependencies (`sqlalchemy`) and the database container are not available in the local execution environment.

## 9. Problems discovered
- The local development environment lacks Docker and local Python dependencies (e.g., `sqlalchemy`), entirely blocking live database interaction.
- The Alembic `env.py` script previously did not import `app.models`, which would have caused `autogenerate` to generate an empty migration script even if a DB connection existed.

## 10. Fixes applied
- `app.models` import added to `alembic/env.py`.
- Copied `.env.example` to a functioning `.env` configuration template.
- Added database reachability check to `GET /health`.
- Created robust `seed_db.py` and `test_db.py` scripts.

## 11. Files changed
- **Created**: `Backend/.env`
- **Created**: `Backend/scripts/seed_db.py`
- **Created**: `Backend/scripts/test_db.py`
- **Modified**: `Backend/alembic/env.py`
- **Modified**: `Backend/app/main.py`

## 12. Remaining database limitations
The actual database tables do not physically exist yet because the initial Alembic migration (`01_initial_schema`) was blocked.

## 13. Preparation for Phase 2B
- **Structural implementation: COMPLETE**
- **Live PostgreSQL validation: BLOCKED — PostgreSQL runtime unavailable**
Before progressing to Phase 2B (Frontend connection), the developer must install Docker, run `docker compose up -d db`, install Python dependencies (`pip install -r requirements.txt`), and execute:
1. `alembic revision --autogenerate -m "initial_schema"`
2. `alembic upgrade head`
3. `python scripts/seed_db.py`
