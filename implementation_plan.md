# SAKSHI Phase 2A: Database Foundation Wiring Plan

## Goal
Transform the current database layer from an unexercised schema into a reliable development database foundation that the FastAPI backend can connect to, complete with Alembic migrations and realistic seed data.

## Proposed Changes

### 1. Database Configuration
- Create a local `Backend/.env` file that configures `DATABASE_URL` pointing to the Docker Compose PostgreSQL instance: `postgresql+asyncpg://sakshi:sakshi_pass@localhost:5432/sakshi_db`.
- Ensure `Backend/alembic.ini` is properly configured.
- Ensure `Backend/app/core/database.py` successfully connects without crashing, and `app/main.py` exposes a `/health` check.

### 2. Alembic Configuration
- Initialize Alembic versioning.
- Generate the initial migration (`01_initial_schema`) to encapsulate the existing SQLAlchemy models (`User`, `Role`, `Case`, `Workflow`, `EvidenceItem`, `AuditLog`, etc.).
- Ensure `alembic upgrade head` executes smoothly.

### 3. Seed Implementation
- Create `Backend/scripts/seed_db.py`.
- Seed Users (Admin, Investigating Officer, Hospital User, FSL User, CWC User, Supervisor).
- Seed a synthetic POCSO case (`POCSO-2026-001`) with dummy workflow stages, demonstrating realistic status transitions (e.g., FIR Registered, Medical Examination, FSL Report).
- The seed script will use SQLAlchemy `async_session` to insert and commit data safely, preventing duplicate insertions via simple existence checks.

### 4. Tests and Verification
- Run a quick backend script (`test_db.py`) to connect to the database, query a Case, and print relationships (Workflow, Evidence) to prove functionality.

> [!IMPORTANT]
> The frontend will remain untouched and in `DEMO_MODE=true`. AI Copilot integrations and the full D-POG intelligence engine will not be implemented in this phase.

## Verification Plan
1. `docker-compose up db` is reachable.
2. `alembic upgrade head` successfully creates all tables.
3. `python scripts/seed_db.py` creates rows.
4. FastAPI `/health` endpoint responds with a healthy DB status.
5. Create `docs/PHASE_2A_DATABASE_REPORT.md` with the final summary.
