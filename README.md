# SAKSHI
## Adaptive Procedural Intelligence Framework for Privacy-Preserving Criminal Investigation Support

[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-4169E1.svg)](https://www.postgresql.org/)
[![Tests](https://img.shields.io/badge/Tests-Validated-success.svg)](#-testing--validation)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**SAKSHI** (*System for Adaptive Knowledge and Systematic Handling of Investigations*) is a research-grade **procedural decision-support and accountability framework** designed to assist authorized investigative officers, supervisors, and administrative authorities in complex criminal investigations (such as POCSO cases).

Rather than serving as a static record database, SAKSHI introduces the concept of a **Procedural Digital Twin**—a dynamic, machine-readable representation of procedural obligations, statutory timelines, dependency graphs, and tamper-evident audit trails.

> [!IMPORTANT]
> **Decision-Support Boundary**: SAKSHI is strictly a **human-in-the-loop decision-support framework**. It is **NOT** an autonomous law enforcement system, guilt prediction engine, or automated sentencing tool. It does **NOT** replace state databases such as CCTNS, ICJS, or e-Courts. All legal decisions remain exclusively with authorized human authorities.

---

## 🎯 Conceptual Pipeline

```mermaid
graph TD
    A[Case Registration / Input State] --> B[Procedural Digital Twin]
    B --> C[Dynamic Procedural Obligation Graph: D-POG]
    C --> D[Root-Blocker & Downstream Cascade Analysis]
    C --> E[Deterministic Procedural Risk Engine]
    E --> F[Event-Triggered Early Warning Intelligence]
    C & D & E --> G[Grounded AI Procedural Copilot]
    B & C & E --> H[Tamper-Evident SHA-256 Audit Chain]
    H --> I[Verifiable Accountability Passport]
```

---

## 🚨 Problem Statement

In complex criminal investigations involving multi-agency procedures (Police, Medical, Forensic Science Laboratories, Child Welfare Committees), existing management systems serve primarily as **passive data repositories**. They record what occurred in the past, but lack the capability to reason over:

- **Pending Obligations**: Which mandatory procedural steps remain unfulfilled?
- **Root Blockers**: Which specific stage failure is delaying downstream progress?
- **Cascade Effects**: How many subsequent procedures are blocked by a single bottleneck?
- **Procedural Risk**: How is overall case risk accelerating due to stalls or approaching statutory deadlines?
- **Audit Integrity**: Has the procedural history been altered or tampered with retroactively?

Recording information is fundamentally different from **continuously reasoning over procedural state**. SAKSHI fills this accountability gap.

---

## 💡 Core Innovation: Procedural Digital Twin & D-POG

SAKSHI models each investigation as a **Procedural Digital Twin**. The core reasoning engine is the **Dynamic Procedural Obligation Graph (D-POG)**.

In D-POG, each stage of an investigation (e.g., FIR Registration, Medical Examination, Section 164 Statement, FSL Evidence Submission, Charge Sheet Preparation) is represented as an obligation node with explicit directed dependencies.

```mermaid
graph LR
    S1[FIR Registration] --> S2[Victim Medical Exam]
    S1 --> S3[Section 161 Statement]
    S2 --> S4[Section 164 Statement]
    S3 --> S4
    S2 --> S5[FSL Sample Collection]
    S5 --> S6[FSL Chemical Analysis]
    S4 & S6 --> S7[Charge Sheet Preparation]

    style S5 fill:#f97316,stroke:#ea580c,stroke-width:2px,color:#fff
    style S6 fill:#ef4444,stroke:#dc2626,stroke-width:2px,color:#fff
    style S7 fill:#64748b,stroke:#475569,stroke-width:1px,color:#fff
```

When a stage transitions (e.g., marked `COMPLETED` or `IN_PROGRESS`), D-POG dynamically recalculates node readiness, identifies root blockers, and measures downstream impact across the entire procedural tree.

---

## 🔥 Key Technical Capabilities

### 1. Root-Blocker & Downstream Impact Analysis
- **Root Blocker Identification**: Performs backward dependency traversal to isolate the exact unfulfilled prerequisite blocking an investigation stage.
- **Downstream Cascade Analysis**: Performs forward breadth-first traversal to compute the total count of downstream procedural stages blocked by a given node.

### 2. Deterministic Procedural Risk Engine
The risk engine evaluates procedural risk **deterministically** without black-box machine learning or arbitrary scoring. The mathematical formula is:

$$\text{Risk Score} = (\text{Readiness Risk} \times 0.35) + (\text{Deadline Factor} \times 0.25) + (\text{Stall Factor} \times 0.20) + (\text{Dependency Factor} \times 0.20)$$

Where:
- $\text{Readiness Risk} = 100 - \text{Procedural Readiness Score}$
- $\text{Deadline Factor} = \text{Score based on deadline proximity/overdue status } (0\text{--}100)$
- $\text{Stall Factor} = \text{Score based on stage inactivity duration } (0\text{--}100)$
- $\text{Dependency Factor} = \text{Aggregated downstream blocker impact } (0\text{--}100)$

#### Deterministic Risk Categories:
| Risk Score Range | Category | Action Requirement |
| :--- | :--- | :--- |
| `0 – 30` | **LOW** | Normal procedural monitoring |
| `31 – 60` | **MEDIUM** | Standard supervisory review |
| `61 – 85` | **HIGH** | Priority intervention required |
| `86 – 100` | **CRITICAL** | Priority procedural intervention / supervisory review |

### 3. Event-Triggered Early-Warning Intelligence
When a workflow stage transitions or risk is recomputed, SAKSHI automatically evaluates **8 deterministic early-warning rules**:

1. `EARLY_WARN_HIGH_RISK`: Procedural risk level reaches `HIGH` or `CRITICAL`.
2. `EARLY_WARN_SCORE_JUMP`: Risk score increases by $\ge 15$ points in a single evaluation.
3. `EARLY_WARN_DEPENDENCY_IMPACT`: Procedural dependency factor impact becomes non-zero ($> 0$).
4. `EARLY_WARN_DOWNSTREAM_CASCADE`: Multi-stage dependency cascade detected ($\text{impact} \ge 50$).
5. `EARLY_WARN_DEADLINE_NEAR`: Approaching stage deadline risk ($\text{impact} \ge 40$).
6. `EARLY_WARN_DEADLINE_OVERDUE`: Critical stage deadline risk ($\text{impact} \ge 75$).
7. `EARLY_WARN_WORKFLOW_STALLED`: Active stage workflow stalled with no activity ($\text{impact} \ge 50$).
8. `EARLY_WARN_RISK_RESOLVED`: Risk level successfully reduced from `HIGH`/`CRITICAL` to `LOW`/`MEDIUM`.

*Deduplication Rule*: Time-window deduplication suppresses identical `(case_id, event_code)` alerts within a **4-hour window** to prevent alert fatigue while allowing distinct event codes to surface immediately.

### 4. Grounded AI Procedural Copilot
SAKSHI includes an AI assistant backed by Gemini. The copilot operates under strict **grounding and safety boundaries**:
- **Live Context Injection**: Reads live D-POG graph state, readiness metrics, root blockers, configured procedural requirements, workflow state, and available deadline information.
- **Deterministic Fallback**: If LLM endpoints are unreachable, returns structured fallback advice directly from rule-based D-POG evaluation.
- **Prohibited Task Refusal**: Strictly refuses legal decision queries (e.g., guilt determination, bail/arrest recommendations, sentencing).

### 5. Tamper-Evident SHA-256 Audit Chain
Every significant system event (case creation, stage transition, risk calculation, document upload) generates an audit entry linked in a cryptographic chain:

$$\text{Event Hash}_i = \text{SHA-256}(\text{Event Payload}_i \parallel \text{Event Hash}_{i-1})$$

The initial audit record links to `previous_hash = "GENESIS"`. Any retroactive modification of an audit record invalidates all subsequent hashes, enabling instant cryptographic verification via `audit_chain_service.verify_chain()`.

### 6. Cryptographic Accountability Passport
Generates a point-in-time, verifiable snapshot of procedural compliance (`AccountabilityPassport`):
- Contains a verifiable procedural snapshot (procedural state, obligation summary, audit verification reference, passport hash, and generation metadata).
- Tracks verification status: `VERIFIED`, `OUTDATED` (if newer case actions occurred), or `TAMPER_DETECTED`.
- **Privacy Boundary**: Strips victim PII (names, exact addresses, contact numbers) to ensure privacy compliance during supervisory transmission.

---

## 🔒 Security & RBAC Architecture

SAKSHI enforces multi-layered server-side security:

- **JWT Authentication**: Cryptographically signed bearer tokens for session management (`require_access_token`).
- **Cryptographic Password Hashing**: Passwords stored using `bcrypt`.
- **Server-Side Actor Verification**: User identity is derived strictly from decoded server-side JWT payloads (`get_current_user`), preventing client-side identity spoofing.
- **Case-Level RBAC & IDOR Protection**: `_verify_case_access` restricts case access to assigned officers. Access across unauthorized case boundaries returns `403 Forbidden`. Elevated roles (`admin`, `supervisor`, `system`) are governed by explicit role policies.

> [!NOTE]
> **Security Boundaries**: Multi-tenant database partition isolation is a planned future hardening area. Current authorization relies on server-side RBAC and case-level officer mapping in PostgreSQL.

---

## 🏗️ System Architecture

```
                  ┌─────────────────────────────────────────┐
                  │          React 18 + Vite + TS           │
                  │   Tailwind CSS / React Flow / Recharts  │
                  └────────────────────┬────────────────────┘
                                       │ HTTP / REST (Axios)
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │           FastAPI v1 Router             │
                  │   Request ID / Logging / CORS Middleware │
                  └────────────────────┬────────────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
┌───────────────────┐        ┌───────────────────┐        ┌───────────────────┐
│   DPOGEngine      │        │   RiskService     │        │ EarlyWarningSvc   │
│  Graph & Blockers │        │ Deterministic Risk│        │ 8 Event Codes     │
└────────┬──────────┘        └─────────┬─────────┘        └─────────┬─────────┘
         │                             │                            │
         ▼                             ▼                            ▼
┌───────────────────┐        ┌───────────────────┐        ┌───────────────────┐
│ AuditChainService │        │  PassportService  │        │ Grounded AICopilot│
│ SHA-256 Hashing   │        │ Cryptographic Snap│        │ Gemini + Fallback │
└────────┬──────────┘        └─────────┬─────────┘        └─────────┬─────────┘
         │                             │                            │
         └─────────────────────────────┼────────────────────────────┘
                                       │ SQLAlchemy Async ORM
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │       PostgreSQL DB (asyncpg)           │
                  │        Managed via Alembic              │
                  └─────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
sakshi-adaptive-procedural-intelligence/
├── Backend/
│   ├── alembic/                      # Alembic database schema migrations
│   │   └── versions/                 # Migration scripts (7A, 7B, 7D)
│   ├── app/
│   │   ├── api/v1/                   # FastAPI route handlers
│   │   │   ├── ai/                   # AI Copilot endpoints
│   │   │   ├── audit/                # Audit chain endpoints
│   │   │   ├── auth/                 # JWT Authentication endpoints
│   │   │   ├── cases/                # Case management endpoints
│   │   │   ├── evidence/             # Evidence tracking endpoints
│   │   │   ├── notifications/        # Notification & early warning APIs
│   │   │   ├── passports/            # Accountability Passport endpoints
│   │   │   ├── readiness/            # Procedural readiness endpoints
│   │   │   ├── risk/                 # Procedural Risk APIs
│   │   │   └── workflow/             # D-POG Workflow stage transition APIs
│   │   ├── core/                     # Config, Database, Logging, Security
│   │   ├── models/                   # SQLAlchemy ORM Models (Case, Workflow, Risk, Audit, etc.)
│   │   ├── schemas/                  # Pydantic validation schemas
│   │   ├── services/                 # Core domain services (DPOGEngine, RiskService, Audit, etc.)
│   │   └── tests/                    # Pytest test suite (Unit & Integration)
│   ├── requirements.txt              # Backend Python dependencies
│   └── alembic.ini                   # Alembic configuration
├── Frontend/
│   └── sakshi-frontend/
│       ├── src/
│       │   ├── components/           # Reusable UI components & layouts
│       │   ├── context/              # React Context providers (Auth, Notification)
│       │   ├── data/                 # Mock synthetic datasets
│       │   ├── pages/                # Page components (Cases, Workflow, Risk, Notifications)
│       │   ├── services/             # Axios API client services (riskService, notificationService)
│       │   ├── types/                # TypeScript type definitions
│       │   └── utils/                # Utility & formatting functions
│       ├── package.json              # Frontend npm dependencies
│       └── vite.config.ts            # Vite configuration
├── docs/                             # Architecture diagrams & specifications
├── implementation_plan.md            # Phase planning documentation
└── README.md                         # Project documentation
```

---

## 📊 Implementation Matrix

| Phase | Subsystem | Description | Status |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Foundation | Codebase audit & architecture setup | **Complete** |
| **Phase 2A** | Database Foundation | SQLAlchemy Async ORM models & PostgreSQL migrations | **Complete** |
| **Phase 2B** | API Core | FastAPI routing, middleware, CORS, request IDs | **Complete** |
| **Phase 2C** | Authentication | JWT bearer auth, bcrypt password hashing | **Complete** |
| **Phase 3** | D-POG Engine | Dynamic Procedural Obligation Graph & blocker analysis | **Complete** |
| **Phase 4** | AI Copilot | Grounded Gemini integration & rule-based fallbacks | **Complete** |
| **Phase 5** | Cryptographic Audit | SHA-256 tamper-evident event chain & verification | **Complete** |
| **Phase 6** | Accountability Passport | Cryptographic case compliance snapshots & verification | **Complete** |
| **Phase 7A** | Deterministic Risk | Weighted 4-factor risk formula engine | **Complete** |
| **Phase 7B** | Risk Security & API | Persistence, history ordering & case-level RBAC | **Complete** |
| **Phase 7C** | Risk Intelligence UI | React Risk Dashboard, Recharts history & D-POG links | **Complete** |
| **Phase 7D** | Early Warning System | 8 event codes, 4-hour window deduplication & transition triggers | **Complete** |

---

## 🧪 Testing & Validation

The framework contains a comprehensive automated test suite verifying backend logic, API contracts, security RBAC, and risk calculations:

- **Backend Test Suite**: Validated unit and integration test suite across:
  - `test_risk_engine_service.py`: Risk formula accuracy & level thresholds.
  - `test_risk_7b.py`: Risk persistence, history ordering, and RBAC authorization.
  - `test_early_warning_7d.py`: 8 early warning triggers, 4-hour deduplication, and IDOR protection.
  - `test_audit_chain_service.py`: SHA-256 chain link integrity & tamper detection.
  - `test_audit_api.py` & `test_audit_hooks.py`: Audit logging hooks.
- **Frontend Type Safety**: `npx tsc --noEmit` passes with `0` TypeScript errors.
- **Frontend Production Build**: `npx vite build` executes cleanly (`0` errors).

---

## 🚀 Local Setup & Installation

### Prerequisites
- Python 3.11+
- Node.js 18+ & npm
- PostgreSQL database instance (or local PostgreSQL)

### 1. Backend Setup

```bash
# Navigate to Backend directory
cd Backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
python -m alembic upgrade head

# Start FastAPI development server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend runs at `http://127.0.0.1:8000` (OpenAPI Swagger docs at `http://127.0.0.1:8000/docs`).*

### 2. Frontend Setup

```bash
# Navigate to Frontend directory
cd Frontend/sakshi-frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
*Frontend runs at `http://localhost:3000` (or `http://localhost:3001` based on port availability, configured to proxy API requests to backend port 8000).*

### 3. Environment Variables (.env)
Create a `.env` file in `Backend/` (do **NOT** commit credentials to source control):

```env
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/sakshi_db
JWT_SECRET=your-secure-jwt-secret-key-at-least-32-chars
GEMINI_API_KEY=your-optional-gemini-api-key
ENVIRONMENT=development
```

---

## 🌐 API Overview

| Prefix | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/auth` | POST | `/login` | Authenticate user & return JWT token |
| `/api/v1/cases` | GET / POST | `/` | List cases / Register new case |
| `/api/v1/cases` | GET | `/{id}` | Retrieve case details |
| `/api/v1/workflow` | POST | `/cases/{id}/workflow/{stage_id}/transition` | Transition stage status & trigger risk recomputation |
| `/api/v1/risk` | GET / POST | `/{case_id}/compute` | Recompute & persist risk assessment |
| `/api/v1/risk` | GET | `/{case_id}/history` | Retrieve historical risk assessments (newest first) |
| `/api/v1/notifications` | GET | `/case/{case_id}/early-warnings` | Retrieve case early warnings (case RBAC protected) |
| `/api/v1/audit` | GET | `/{case_id}` | Retrieve SHA-256 audit log chain |
| `/api/v1/audit` | GET | `/{case_id}/verify` | Cryptographically verify audit chain integrity |
| `/api/v1/passports` | POST | `/generate` | Generate cryptographic Accountability Passport |
| `/api/v1/passports` | GET | `/{id}/verify` | Verify passport integrity & staleness |
| `/api/v1/ai` | POST | `/query` | Query grounded AI Procedural Copilot |

---

## 🎬 Guided Demonstration Flow

1. **Log In**: Sign in as an authorized investigative officer (`officer1@sakshi.gov.in`).
2. **Open Synthetic Case**: Select a POCSO investigation case (e.g., `SAKSHI/2024/001`).
3. **Inspect Workflow**: View the active stage and mandatory statutory requirements.
4. **Explore D-POG**: Switch to the **Workflow Graph** tab to visualize node dependencies.
5. **Identify Root Blockers**: Observe highlighted unfulfilled prerequisite stages.
6. **Compute Risk**: Open **Procedural Risk Intelligence** tab to view the live 4-factor risk gauge.
7. **Transition Stage**: Progress a stage (e.g., mark "Section 161 Statement" as `COMPLETED`).
8. **Observe Early Warning**: Notice event-triggered early-warning alerts (`EARLY_WARN_SCORE_JUMP` / `EARLY_WARN_RISK_RESOLVED`) appearing in the `EarlyWarningBanner`.
9. **Query AI Copilot**: Ask for next procedural steps; observe grounded context referencing D-POG state.
10. **Verify Audit Chain**: Navigate to Audit view and execute SHA-256 chain verification.
11. **Generate Passport**: Export an Accountability Passport snapshot and verify its status (`VERIFIED`).

---

## ⚠️ Recognized System Limitations

To maintain research rigor and transparency, the following technical boundaries are acknowledged:

1. **Synthetic Demo Data**: Demonstration dataset uses synthetic case records for privacy compliance.
2. **No Direct State Database Integration**: SAKSHI is a standalone support framework and does not connect directly to CCTNS/ICJS production databases.
3. **Restricted AI Authority**: The AI Copilot cannot provide legal judgments, guilt assessments, or sentencing advice.
4. **Organizational Multi-Tenancy**: Database partitioning across independent law enforcement organizations is a future scope item.
5. **On-Demand / Event-Driven REST**: Notifications operate via event-triggered REST evaluation rather than WebSocket streaming.

---

## 🔮 Future Roadmap

- **Phase 8**: System Validation, Benchmarking & Deployment
  - Comprehensive synthetic dataset evaluation across 500+ simulated investigation lifecycles.
  - Performance benchmarking of D-POG recalculation under high node density.
  - Multi-tenant database partition architecture.
  - WebSocket support for real-time notification push.
  - Expanded case-type templates (Cybercrime, Homicide, Financial Fraud).

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.