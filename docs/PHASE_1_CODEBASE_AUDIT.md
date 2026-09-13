# SAKSHI Phase 1 Codebase Audit

## 1. Executive Summary
The SAKSHI codebase demonstrates a clear structural foundation but relies heavily on mock data and a `DEMO_MODE` flag. The conceptual architecture for case management, workflow, and evidence tracking is established in the backend models and frontend UI, but true end-to-end integration is missing.

## 2. Actual Technology Stack
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, React Router, React Flow (for D-POG), Axios.
- **Backend**: Python, FastAPI, SQLAlchemy (asyncpg), Alembic, Uvicorn.
- **Database**: PostgreSQL (expected), Supabase (configured).

## 3. Repository Structure
```
sakshi-adaptive-procedural-intelligence-main
├── Backend
│   ├── alembic (migrations)
│   ├── app
│   │   ├── api (v1 endpoints)
│   │   ├── core (config, DB, logging)
│   │   ├── models (SQLAlchemy ORM)
│   │   ├── schemas (Pydantic models)
│   │   └── services (business logic)
│   ├── Dockerfile
│   └── requirements.txt
├── Frontend
│   └── sakshi-frontend
│       ├── src
│       │   ├── components
│       │   ├── config
│       │   ├── data (mock data)
│       │   ├── pages
│       │   ├── services (API clients)
│       │   └── types
│       └── package.json
└── docs
```

## 4. Frontend Architecture
The frontend is a React application built with Vite. It features a modern tech stack (Tailwind, Radix UI). Crucially, API calls in `src/services/` are gated by a `DEMO_MODE` flag (defaulting to true) which bypasses network requests and returns hardcoded mock data from `src/data/*.data.ts`.

## 5. Backend Architecture
The backend is a FastAPI application structured with domain-driven design (routers, models, schemas, services). It uses SQLAlchemy for async database interactions. The API endpoints are defined, but many complex endpoints (like AI) return static mocked responses.

## 6. Database Architecture
SQLAlchemy models are defined for `Case`, `Workflow`, `WorkflowHistory`, `EvidenceItem`, `EvidenceIntegrity`, `EvidenceTransfer`, `AuditLog`, `RiskAssessment`, `Document`, `Report`, etc. 

## 7. Authentication & Authorization
- **Frontend**: Mocked in demo mode, returning dummy users and tokens.
- **Backend**: Implements JWT-based authentication (`require_access_token` dependency) and role-based models, but currently untested end-to-end.

## 8. Feature-by-Feature Status

| Feature | Frontend | Backend | Database | Integration | Status | Notes |
|---|---|---|---|---|---|---|
| Authentication | UI exists | JWT implemented | User models | Mocked | Partially working | Uses dummy data in frontend |
| Case Creation | UI exists | Route exists | Case model | Mocked | Partially working | Disconnected due to DEMO_MODE |
| Workflow / D-POG | React Flow UI | Route exists | Workflow model | Mocked | UI-only | Graph uses static mock data |
| Evidence | UI exists | Route exists | Evidence models | Mocked | Mocked | Includes hash fields but not functional |
| Audit / Integrity | UI exists | Route exists | AuditLog model | Mocked | Mocked | No real SHA-256 chain in action |
| AI Assistant | UI exists | Route mocked | N/A | Mocked | Backend-only mock | No Gemini API call is made |

## 9. Frontend ↔ Backend Integration Findings
End-to-end integration is completely severed by default. The frontend's `DEMO_MODE` flag intercepts all service calls (Auth, Cases, Evidence, Notifications, AI, Analytics) and resolves them with timeouts and static arrays. The backend has actual endpoints but they are largely uncalled.

## 10. AI Implementation Audit
The AI implementation is entirely simulated. Both the frontend service (`aiService.ts`) and the backend routes (`api/v1/ai/router.py`) return hardcoded static data (`_mock_summary`, `_mock_risk`, etc.). No external AI APIs (like Gemini) are invoked. It does not receive actual case data or workflow state yet.

## 11. Workflow / D-POG Audit
The workflow is visually represented using React Flow in the frontend but relies on mock data. The backend `Workflow` model exists and tracks stages, deadlines, and officers, but true dynamic dependency calculation, root blocker analysis, and downstream state recalculation are not implemented.

## 12. Evidence Audit
The frontend has an evidence UI. The backend models (`EvidenceItem`, `EvidenceTransfer`, `EvidenceIntegrity`) have fields for initial/current hashes, chain of custody, and GPS coordinates. However, cryptographic verification and end-to-end flow are not yet connected or fully functional.

## 13. Audit / Integrity Audit
An `AuditLog` table exists in the backend to capture events, but a true, tamper-evident hash chain linking sequential events cryptographically is missing. The current implementation is a standard relational log.

## 14. Security Audit
- **CORS**: Configured in FastAPI.
- **Secrets**: `.env.example` exists. Secrets are managed via environment variables.
- **Vulnerabilities**: Low risk currently, as it's a demo. Real JWT handling is implemented in the backend but needs rigorous testing once DEMO_MODE is disabled.

## 15. Deployment Audit
A `Dockerfile` and `docker-compose.yml` exist in the backend. The frontend is standard Vite (can be deployed to Vercel/Netlify). Environment configurations are prepared for Supabase integration.

## 16. Technical Debt
The heaviest technical debt is the bifurcation caused by `DEMO_MODE`. The backend and frontend have evolved somewhat independently around mocked structures. The AI logic is hardcoded rather than service-driven.

## 17. Bugs Found
No critical runtime bugs were encountered because the system operates in isolation (frontend mocks, backend isolated). The primary issue is the lack of connection between the two layers.

## 18. Safe Fixes Applied
None applied yet. The audit was strictly observational.

## 19. Files Changed
None.

## 20. Files That Should NOT Be Changed
- Base FastAPI and Vite/React config files.
- Existing layout components unless strictly necessary.

## 21. KEEP / MODIFY / REPLACE / CREATE Matrix

| Existing Component | Decision | Reason |
|---|---|---|
| React frontend | KEEP | Strong foundation |
| FastAPI backend | KEEP | Solid async architecture |
| `DEMO_MODE` Data | DEPRECATE | Prevents real integration |
| Existing Workflow | MODIFY | Needs extension for Dynamic Procedural Obligation Graph (D-POG) |
| AI Integration | REPLACE | Hardcoded mocks must be replaced with real Gemini integration |
| AuditLog | MODIFY | Needs to implement a true cryptographic hash chain |

## 22. Recommended Phase 2 Plan
1. **Disable `DEMO_MODE`**: Connect the frontend to the backend and fix the ensuing integration breaks.
2. **Database Seeding**: Replace frontend mock files with a backend seed script to populate a local Postgres/Supabase instance.
3. **Core API Finalization**: Ensure CRUD operations for Cases and Evidence work end-to-end.
4. **Auth Wiring**: Validate the JWT flow from login screen to protected API routes.
