# Phase 2B Integration Audit

## 1. Data Flow Analysis
The frontend uses `axios` (`src/services/api/client.ts`) for network requests.
Currently, the `DEMO_MODE` flag (defined in `demo.config.ts`) intercepts *every* service method (in `authService`, `caseService`, `evidenceService`, `notificationService`, `analyticsService`, `aiService`) before `apiClient` is called, simulating a network delay and returning static mock data from `src/data/`.

## 2. Pages Using Mock/Static Data
Because `DEMO_MODE` intercepts calls at the service layer, **all dynamic pages** are currently using mock data. No page is making real API calls.
- **Login/Auth**: Uses `OFFICERS` data.
- **Dashboard**: Uses `KPI_STATS` and other static chart data.
- **Cases List/Detail**: Uses `CASES`.
- **Evidence List/Detail**: Uses `EVIDENCE_ITEMS`.
- **AI/Notifications**: Uses `CASE_AI_SUMMARIES`, `APP_NOTIFICATIONS`.

## 3. Existing Endpoints Mapping
FastAPI already provides equivalent endpoints for the main frontend flows:
- `authService` ➔ `app.api.v1.auth.router` (`/auth/login`, `/auth/me`, etc.)
- `caseService` ➔ `app.api.v1.cases.router` (`/cases`, `/cases/{id}`, etc.)
- `evidenceService` ➔ `app.api.v1.evidence.router` (`/evidence`, `/evidence/{id}`, etc.)
- `analyticsService` ➔ `app.api.v1.analytics.router` (`/analytics/kpis`, etc.)

## 4. Frontend/Backend Mismatches
- **UUIDs vs Strings**: The frontend mock data uses short string IDs (`"c1"`). The backend expects standard `UUID`s. When real data is fetched, the frontend will automatically use the UUIDs provided by the backend, resolving this issue dynamically, but hardcoded URL tests will fail.
- **Unused Routes**: The backend exposes modular routes (`/risk`, `/readiness`, `/workflow`) that the frontend consumes via aggregated or nested paths (`/analytics/risk-dist`, `/cases/{id}/workflow/{stage_id}`).

## 5. Request/Response Schemas
The frontend `ApiResponse<T>` and `PaginatedResponse<T>` wrappers match the backend `ApiResponse` and `PaginatedResponse` Pydantic models perfectly. Both expect:
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

## 6. Authentication Assumptions
The frontend expects `accessToken` and `refreshToken` on login, and subsequently sends `Authorization: Bearer <accessToken>`. The backend is configured to issue and accept standard JWTs matching this exact pattern.

## 7. CORS and Base-URL
- **Base URL**: The frontend uses `VITE_API_BASE_URL` (default `http://localhost:8000/api/v1`).
- **CORS**: The backend `app/main.py` is configured to allow `http://localhost:5173` via the `.env` `ALLOWED_ORIGINS` setting. This is correctly aligned for local Vite development.
