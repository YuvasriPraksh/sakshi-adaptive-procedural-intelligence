# PHASE 3 — D-POG / PROCEDURAL DIGITAL TWIN ENGINE IMPLEMENTATION REPORT

**Project**: SAKSHI AI-Powered Procedural Intelligence Platform  
**Phase**: Phase 3 (Dynamic Procedural Obligation Graph & Procedural Digital Twin Engine)  
**Date**: September 13, 2026  
**Status**: IMPLEMENTED & VERIFIED  

---

## 1. Executive Summary

Phase 3 establishes the deterministic procedural core of SAKSHI: the **Dynamic Procedural Obligation Graph (D-POG)**. Rather than modeling pre-trial investigations as flat static task lists, SAKSHI now executes a real-time Directed Acyclic Graph (DAG) backed by live PostgreSQL database records.

The engine evaluates procedural prerequisites, dynamically identifies root blockers causing downstream procedural delays, calculates blast radii across statutory milestones, and produces an explainable **Procedural Readiness Indicator**. The React Flow frontend renders this digital twin state in real time and supports bidirectional workflow transitions.

---

## 2. Positioning Statement

SAKSHI is:
> *"An AI-assisted procedural intelligence and accountability layer for sensitive pre-trial investigations."*

The D-POG engine provides deterministic operational and compliance decision support (monitoring procedural dependencies, chain-of-custody milestones, and statutory deadlines). SAKSHI does **not** determine guilt, innocence, credibility, arrest, bail, or judicial outcomes.

---

## 3. Architecture & Algorithmic Modules

### A. Procedural State Model (`DPOGEngine`)
The engine categorizes each investigation obligation into deterministic states:
- `COMPLETED`: Obligation fulfilled and timestamped in PostgreSQL.
- `IN_PROGRESS`: Actively assigned and under execution.
- `READY`: All prerequisite obligations satisfied; immediately actionable.
- `BLOCKED`: One or more prerequisite obligations or verifications are incomplete.
- `AWAITING_EXTERNAL`: Waiting on external statutory agencies (e.g. FSL / external medical board).
- `OVERDUE`: Mandatory statutory or operational deadline lapsed prior to completion.
- `COMPLETED_UNVERIFIED`: Action performed but mandatory documentary proof is pending.
- `NOT_STARTED` / `PENDING`: Initial state.

### B. Prerequisite & Root Blocker Traversal Algorithm
Given any blocked obligation $N$:
1. Perform a backward traversal across the prerequisite DAG.
2. Isolate incomplete parent obligations.
3. Identify the **Root Blocker** (the earliest uncompleted ancestor node that has all of its own prerequisites satisfied or is actively stalled).
4. Construct the full blocker chain and generate a deterministic explanation (e.g. *"Evidence Review is blocked because FSL Analysis & Forensic Report is pending (FSL)"*).

### C. Downstream Impact Analysis
Given any obligation $N$:
1. Perform forward Breadth-First Search (BFS) over dependent edges.
2. Count all directly and indirectly affected downstream stages.
3. Flag whether the statutory chargesheet target (e.g. Stage 9 under Sec 173 CrPC / Sec 35 POCSO) is in the blast radius.

### D. Procedural Readiness Indicator Formula
The engine calculates an explainable percentage $(0-100\%)$:
$$\text{Readiness} = \text{Base Completion (up to 70\%)} + \text{In-Progress Bonus (up to 10\%)} + \text{Path Integrity Score (up to 20\%)} - \text{Blocker Penalty}$$
- Generates transparent point breakdown: `baseCompletionPoints`, `activeProgressPoints`, `pathIntegrityPoints`, and `blockerDeductions`.

### E. Standard POCSO Procedural Template (`TPL-POCSO-V1`)
Standard 9-stage pre-trial statutory workflow:
1. `FIR_REGISTRATION` (Order 1, Police) — Prerequisites: None
2. `CASE_INTAKE_CWC` (Order 2, CWC) — Prerequisites: [Stage 1]
3. `MEDICAL_EXAM` (Order 3, Hospital) — Prerequisites: [Stage 1] (24hr mandate)
4. `EVIDENCE_COLLECTION` (Order 4, Police) — Prerequisites: [Stage 1, Stage 3]
5. `FSL_SUBMISSION` (Order 5, Police) — Prerequisites: [Stage 4]
6. `FSL_ANALYSIS_REPORT` (Order 6, FSL) — Prerequisites: [Stage 5] *(Demonstrable bottleneck)*
7. `EVIDENCE_REVIEW` (Order 7, Police) — Prerequisites: [Stage 3, Stage 6]
8. `INVESTIGATION_REVIEW` (Order 8, Supervisor) — Prerequisites: [Stage 7]
9. `PROSECUTION_READINESS` (Order 9, Police) — Prerequisites: [Stage 8] (60-day target)

---

## 4. API Specification

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/v1/cases/{case_id}/procedural-graph` | `GET` | Evaluates & returns real-time D-POG nodes, edges, root blockers, downstream impacts, and readiness indicator. | Yes (Bearer JWT) |
| `/api/v1/cases/{case_id}/workflow/{stage_id}/transition` | `POST` | Updates stage status in PostgreSQL, logs to `workflow_history`, and returns recalculated graph state. | Yes (Bearer JWT) |

---

## 5. Verification & Test Results

| # | Test Scenario | Classification | Result | Details |
|---|---------------|----------------|--------|---------|
| 1 | **Initial D-POG Graph Evaluation** | `VERIFIED` | `PASS` | `GET /api/v1/cases/{case_id}/procedural-graph` evaluated 9 nodes and 10 directed edges for `POCSO-2026-001`. Stages 1-5 returned `COMPLETED`, Stage 6 `IN_PROGRESS`, Stages 7-9 `BLOCKED`. |
| 2 | **Root Blocker Identification** | `VERIFIED` | `PASS` | Stage 7 (`Evidence Review`) accurately flagged `rootBlockerId == "stage_6"` (`FSL Analysis & Forensic Report`) with downstream blast radius = 3. |
| 3 | **Downstream Impact Calculation** | `VERIFIED` | `PASS` | Stage 6 identified as impacting 3 downstream stages including Stage 9 Final Chargesheet. |
| 4 | **Procedural Readiness Calculation** | `VERIFIED` | `PASS` | Computed 45% (`PROCEDURALLY_BOTTLENECKED`) with factor breakdown: 38.9 base + 1.1 in-progress + 5.0 path integrity (penalized by 15.0 blocker deduction). |
| 5 | **Workflow State Transition & Recalculation** | `VERIFIED` | `PASS` | `POST .../workflow/stage_6/transition` (`completed`) transitioned FSL Report to `COMPLETED`. Stage 7 dynamically transitioned from `BLOCKED` to `READY` (Actionable). Readiness updated to 57%. |
| 6 | **Audit Trail Logging** | `VERIFIED` | `PASS` | Transition recorded in PostgreSQL `workflow_history` table (`previousStatus="in_progress"`, `newStatus="completed"`). |
| 7 | **Frontend React Flow Integration** | `VERIFIED` | `PASS` | Connected `WorkflowGraphTab.tsx` and `GraphPage.tsx` to live backend API. Supports node inspection, root blocker alerts, and interactive transition triggers. |
| 8 | **Frontend Build & TypeScript Validation** | `VERIFIED` | `PASS` | `npm run build` completed cleanly in 5.51s with **0 TypeScript errors** and **0 build errors** (3,102 modules transformed). |

---

## 6. Files Changed & Created

### Backend:
- `[NEW]` [`Backend/app/core/dpog_templates.py`](file:///c:/Users/HP/OneDrive/Desktop/sakshi-adaptive-procedural-intelligence-main%20%281%29/sakshi-adaptive-procedural-intelligence-main/Backend/app/core/dpog_templates.py): Standard POCSO procedural investigation template.
- `[NEW]` [`Backend/app/services/dpog_service.py`](file:///c:/Users/HP/OneDrive/Desktop/sakshi-adaptive-procedural-intelligence-main%20%281%29/sakshi-adaptive-procedural-intelligence-main/Backend/app/services/dpog_service.py): D-POG graph engine, root blocker analyzer, readiness calculator.
- `[MODIFY]` [`Backend/app/schemas/workflow.py`](file:///c:/Users/HP/OneDrive/Desktop/sakshi-adaptive-procedural-intelligence-main%20%281%29/sakshi-adaptive-procedural-intelligence-main/Backend/app/schemas/workflow.py): Pydantic models for D-POG nodes, edges, blockers, and transitions.
- `[MODIFY]` [`Backend/app/api/v1/cases/router.py`](file:///c:/Users/HP/OneDrive/Desktop/sakshi-adaptive-procedural-intelligence-main%20%281%29/sakshi-adaptive-procedural-intelligence-main/Backend/app/api/v1/cases/router.py): Mounted `/cases/{case_id}/procedural-graph` and transition routes.
- `[MODIFY]` [`Backend/app/api/v1/workflow/router.py`](file:///c:/Users/HP/OneDrive/Desktop/sakshi-adaptive-procedural-intelligence-main%20%281%29/sakshi-adaptive-procedural-intelligence-main/Backend/app/api/v1/workflow/router.py): Added D-POG routes.
- `[MODIFY]` [`Backend/scripts/seed_db.py`](file:///c:/Users/HP/OneDrive/Desktop/sakshi-adaptive-procedural-intelligence-main%20%281%29/sakshi-adaptive-procedural-intelligence-main/Backend/scripts/seed_db.py): Seeded 9 standard POCSO stages representing the demonstration bottleneck scenario.

### Frontend:
- `[NEW]` [`Frontend/sakshi-frontend/src/types/dpog.types.ts`](file:///c:/Users/HP/OneDrive/Desktop/sakshi-adaptive-procedural-intelligence-main%20%281%29/sakshi-adaptive-procedural-intelligence-main/Frontend/sakshi-frontend/src/types/dpog.types.ts): TypeScript D-POG models.
- `[MODIFY]` [`Frontend/sakshi-frontend/src/services/caseService.ts`](file:///c:/Users/HP/OneDrive/Desktop/sakshi-adaptive-procedural-intelligence-main%20%281%29/sakshi-adaptive-procedural-intelligence-main/Frontend/sakshi-frontend/src/services/caseService.ts): Added `getProceduralGraph` and `transitionWorkflowStage` API clients.
- `[MODIFY]` [`Frontend/sakshi-frontend/src/pages/cases/components/WorkflowGraphTab.tsx`](file:///c:/Users/HP/OneDrive/Desktop/sakshi-adaptive-procedural-intelligence-main%20%281%29/sakshi-adaptive-procedural-intelligence-main/Frontend/sakshi-frontend/src/pages/cases/components/WorkflowGraphTab.tsx): Real-time React Flow canvas, node inspection, root blocker insights, and interactive stage resolution.
- `[MODIFY]` [`Frontend/sakshi-frontend/src/pages/graph/GraphPage.tsx`](file:///c:/Users/HP/OneDrive/Desktop/sakshi-adaptive-procedural-intelligence-main%20%281%29/sakshi-adaptive-procedural-intelligence-main/Frontend/sakshi-frontend/src/pages/graph/GraphPage.tsx): Live case selector and D-POG canvas integration.

---

## 7. Status Classification & Scope Summary

- **IMPLEMENTED & VERIFIED**:
  - Deterministic D-POG dependency engine and DAG builder
  - Backward Root Blocker graph traversal algorithm
  - Forward Downstream Impact and chargesheet blast radius analysis
  - Procedural Readiness Indicator calculation
  - POCSO standard 9-stage procedural template
  - Real FastAPI endpoints backed by Supabase PostgreSQL
  - React Flow visualization and interactive stage transitions
  - PostgreSQL `workflow_history` audit trail logging
- **NOT IMPLEMENTED / OUT OF SCOPE (RESERVED FOR FUTURE PHASES)**:
  - LLM / Gemini AI Copilot integration (Phase 4+)
  - Cryptographic SHA-256 hash chains (Phase 5+)
  - Accountability Passport PDF export (Phase 6+)
