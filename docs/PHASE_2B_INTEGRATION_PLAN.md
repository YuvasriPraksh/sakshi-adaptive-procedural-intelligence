# Phase 2B Integration Plan

## 1. Existing Frontend API Services Map
The frontend encapsulates all API interactions within `src/services/`.
- **`apiClient` (`api/client.ts`)**: Configured with `VITE_API_BASE_URL` (default `http://localhost:8000/api/v1`). Injects `Authorization: Bearer` and intercepts 401s to handle logout/redirects.
- **`authService`**: `/auth/login`, `/auth/logout`, `/auth/me`, `/auth/register`, `/auth/forgot-password`, `/auth/refresh`
- **`caseService`**: `/cases`, `/cases/:id`, `/cases` (POST), `/cases/:id` (PATCH), `/cases/:caseId/workflow/:stageId`, `/cases/:caseId/assign`
- **`evidenceService`**: `/evidence/stats`, `/evidence`, `/evidence/:id`, `/evidence` (POST), `/evidence/:id/transfer`, `/evidence/:id/verify`, `/evidence/alerts`
- **`notificationService`**: `/notifications`, `/notifications/:id/read`, `/notifications/mark-all-read`, `/notifications/:id`, `/notifications/unread-count`
- **`analyticsService`**: `/analytics/kpis`, `/analytics/monthly-trend`, `/analytics/crime-types`, `/analytics/status-dist`, `/analytics/risk-dist`, `/analytics/officer-performance`, `/analytics/department-cases`, `/analytics/readiness-dist`
- **`aiService`**: `/ai/cases/:caseId/summary`, `/ai/cases/:caseId/risk`, `/ai/cases/:caseId/readiness`, `/ai/cases/:caseId/missing`, `/ai/cases/:caseId/recommendations`, `/ai/chat`

## 2. DEMO_MODE Bypasses
In **every single method** of the services listed above, the application checks `if (DEMO_MODE)`. If true, it bypasses `apiClient`, awaits a simulated network delay (`DEMO_DELAY`), and returns static mock data imported from `src/data/*.data.ts` (e.g., `CASES`, `EVIDENCE_ITEMS`, `KPI_STATS`).

## 3. Frontend to Backend Endpoint Mapping
The backend FastAPI router (`app/api/v1/router.py`) maps almost 1:1 with the frontend services:
- `authService` ➔ `app.api.v1.auth.router`
- `caseService` ➔ `app.api.v1.cases.router`
- `evidenceService` ➔ `app.api.v1.evidence.router`
- `analyticsService` ➔ `app.api.v1.analytics.router`
- `notificationService` ➔ `app.api.v1.notifications.router`
- `aiService` ➔ `app.api.v1.ai.router`

## 4. FastAPI Endpoints Not Consumed
The backend exposes several modular routers that the frontend does not currently call directly (or calls via a different path):
- `/audit`
- `/reports`
- `/risk` (Frontend calls `/analytics/risk-dist` instead)
- `/workflow` (Frontend calls `/cases/:caseId/workflow/:stageId` instead)
- `/readiness` (Frontend calls `/analytics/readiness-dist` instead)
- `/public`

## 5. Frontend Pages Using Static/Mock Data
Because the entire app relies on the `DEMO_MODE` interception at the service layer, **all dynamic pages** are currently using static data. When `DEMO_MODE=false` is set, they will automatically attempt to call the real backend:
- **Login/Auth**: Will call `/auth/login` instead of `OFFICERS` data.
- **Dashboard**: Will call `/analytics/kpis` instead of `KPI_STATS`.
- **Cases List/Detail**: Will call `/cases` and `/cases/:id` instead of `CASES`.
- **Evidence List/Detail**: Will call `/evidence` instead of `EVIDENCE_ITEMS`.

## 6. API Contract Mismatches Found
Overall, the architectural alignment is excellent, utilizing identical `ApiResponse[T]` and `PaginatedResponse[T]` wrappers. However, key mismatches exist:
- **ID Data Types**: The frontend mock data uses short strings for IDs (e.g., `c1`, `e1`). The backend strictly enforces `UUID` types in the path parameters (e.g., `@router.get("/{case_id}") async def get_case(case_id: UUID)`). When the app switches to real data, the frontend routes will use the backend-provided UUIDs, so this won't break the UI, but hardcoded URL testing will fail.
- **Workflow State**: The backend treats `case.workflow` as a `JSONB` array and updates it via `/cases/{case_id}/workflow/{stage_id}`. Ensure the frontend `WorkflowStage` type exactly matches the JSONB schema.
- **Evidence Transfer**: The backend creates complex nested `chain` objects (`CustodyEvent`). The frontend must be prepared to render these properties.

## 7. CORS, Base-URL, and Environment Config
- **Backend CORS**: Configured via `ALLOWED_ORIGINS` in `.env`. By default, it allows `http://localhost:5173` (Vite's default port).
- **Frontend URL**: Must configure `VITE_API_BASE_URL=http://localhost:8000/api/v1` in `Frontend/sakshi-frontend/.env.local`.
- **Global Toggle**: `VITE_DEMO_MODE=false` must be set in the frontend environment to drop the simulation layer.

## 8. Safest Order for Replacing DEMO_MODE
Because `VITE_DEMO_MODE` is a global boolean, switching it off instantly connects *all* services to the backend. The safest order of implementation is:
1. **Seed the Database**: Ensure the backend database contains robust data matching the structure of the mock data, otherwise the frontend UI will look broken/empty.
2. **Auth & Cases**: Verify login and case retrieval first.
3. **Evidence**: Verify chain-of-custody and transfer endpoints.
4. **Analytics/Dashboards**: Verify the dashboard charts populate correctly from the backend stubs.
5. **AI/Notifications**: Leave these endpoints returning hardcoded stubs in the backend for now, as they are not the focus of Phase 2B.

## 9. Minimum End-to-End Path
The critical path to verify during Phase 2B integration is:
**Login** (Authenticate as Police Officer) ➔ **Cases Page** (Fetch list) ➔ **Case Detail Page** (Fetch by ID) ➔ **Workflow Tab** (Update stage to "completed") ➔ **Evidence Page** (List evidence) ➔ **Dashboard** (View updated KPIs).

## 10. Proposed Phase 2B Implementation Checklist
- [ ] 1. Ensure Supabase/PostgreSQL is running and accessible.
- [ ] 2. Execute Alembic migrations (`alembic upgrade head`).
- [ ] 3. Run the backend seed script (`seed_db.py`) to populate the real database.
- [ ] 4. Create `Frontend/sakshi-frontend/.env.local` containing `VITE_DEMO_MODE=false` and `VITE_API_BASE_URL=http://localhost:8000/api/v1`.
- [ ] 5. Start the FastAPI backend (`uvicorn app.main:app --reload`).
- [ ] 6. Start the React frontend (`npm run dev`).
- [ ] 7. Perform a manual QA walkthrough of the minimum end-to-end path.
- [ ] 8. Address any strict typing or UUID parsing errors in the frontend API responses.
