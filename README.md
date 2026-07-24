# SAKSHI

### AI-Powered Procedural Intelligence Platform for Pre-Court POCSO Investigation

*A scalable procedural intelligence platform designed for POCSO investigations, with an extensible architecture that can support multiple criminal case workflows in future releases.*

> **Prototype Scope:** This prototype focuses on the pre-court investigation workflow for POCSO cases. The underlying architecture is designed to be extensible and can be adapted to support other criminal case types, such as theft, road accidents, cybercrime, and homicide, in future versions.

## 👥 Team Details

| Field | Details |
|-------|---------|
| **Project Name** | SAKSHI |
| **Team Name** | TechSphere |
| **Hackathon** | Rush Hour |
| **Institution** | Sri Manakula Vinayagar Engineering College (Autonomous) |
| **Department** | B.Tech Artificial Intelligence & Data Science |

### Team Members

| Name | Role | Responsibilities |
|------|------|------------------|
| **Yuvasri Prakash** | Team Lead | Project Management, System Design, AI Integration, Documentation |
| **Dharanii K** | Documentation & Frontend Developer | README Documentation, UI Design, Frontend Development |
| **Nalini N** | Frontend Developer | Dashboard Development, User Interface, Public Portal |
| **Sharani V** | Backend Developer | Backend APIs, Database Management, Authentication & Business Logic |

## 🚨 Problem Statement

The investigation of POCSO (Protection of Children from Sexual Offences) cases involves multiple stakeholders, including the Police Department, Hospitals, Child Welfare Committee (CWC), and Forensic Science Laboratory (FSL). Each organization performs critical responsibilities that must be completed within specific procedural timelines before the charge sheet is submitted to the court.

However, the current workflow is often fragmented, with information maintained across different systems or recorded manually. This lack of coordination makes it difficult to monitor investigation progress, identify pending tasks, detect procedural delays, and understand dependencies between agencies. As a result, investigators may face unnecessary delays, reduced transparency, and challenges in ensuring timely completion of legally required procedures.

Additionally, there is no unified platform that provides investigators and authorized stakeholders with a real-time visual representation of the investigation workflow, highlights blocked stages, predicts procedural risks, and explains what actions are required next. These challenges can slow down investigations and impact the overall efficiency of the justice delivery process.

Therefore, there is a need for an intelligent procedural coordination platform that improves collaboration, enhances transparency, tracks investigation progress, and assists authorities in completing pre-court investigations efficiently.

## 💡 Proposed Solution

SAKSHI is an AI-powered procedural intelligence platform designed to streamline the **pre-court investigation workflow of POCSO cases** by providing a unified digital platform for all key stakeholders involved in the investigation process.

The system enables **Police Officers, Hospital Staff, Child Welfare Committee (CWC) Officers, and Forensic Science Laboratory (FSL) Officers** to securely access role-based dashboards and update investigation progress at each stage. Instead of relying on fragmented records and manual coordination, SAKSHI provides a centralized workflow where every procedural step is tracked in real time.

At the core of the platform is the **Dynamic Procedural Obligation Graph (D-POG)**, which models the investigation workflow as interconnected stages. It visualizes task dependencies, identifies blocked or pending procedures, tracks investigation progress, and ensures that mandatory procedural steps are completed before the charge sheet is submitted.

To further assist investigators, **Gemini AI** analyzes the current workflow and provides explainable recommendations, identifies missing procedural steps, explains investigation delays, and suggests the next appropriate action based on the case status.

The platform also includes a **Public Case Tracking Portal**, allowing authorized citizens to securely view the current investigation stage and overall progress without exposing confidential investigation details, thereby improving transparency while protecting victim privacy.

By combining workflow visualization, AI-assisted decision support, secure role-based access, and centralized case management, SAKSHI helps investigative agencies coordinate more effectively, reduce procedural delays, and improve the efficiency of pre-court POCSO investigations.


# ✨ Key Features

## 🔐 1. Secure Role-Based Login
Different stakeholders access the system through secure role-based authentication.

**Supported Roles**
- 👮 Police Officer
- 🏥 Hospital Staff
- 👨‍👩‍👧 Child Welfare Committee (CWC)
- 🧪 FSL Officer
- 👤 Public User

---

## 📂 2. Centralized Case Management
All investigation activities are managed from a single platform, eliminating fragmented records and improving coordination between departments.

**Capabilities**
- Register new cases
- View assigned cases
- Update investigation stages
- Track case progress

---

## 🕸️ 3. Dynamic Procedural Obligation Graph (D-POG)
The core innovation of SAKSHI.

Instead of displaying investigation as a simple checklist, the system represents every investigation stage as an interconnected procedural graph.

It helps users to:
- Visualize investigation workflow
- Understand task dependencies
- Detect blocked procedures
- Identify pending mandatory steps
- Track investigation progress

---

## ⏳ 4. Investigation Timeline
Displays the complete chronological journey of a case from complaint registration until charge sheet submission.

The timeline highlights:
- Completed stages
- Current investigation stage
- Pending activities
- Expected next step

---

## 🤖 5. AI Investigation Assistant
Powered by Gemini AI to assist investigators during the investigation process.

The AI can:
- Explain investigation delays
- Recommend the next procedural step
- Identify missing procedural requirements
- Answer workflow-related questions
- Generate investigation summaries

---

## 🚨 6. Smart Alerts & Notifications
The system continuously monitors procedural progress and alerts users whenever attention is required.

Examples include:
- Missing investigation steps
- Pending approvals
- Delayed activities
- Upcoming procedural deadlines

---

## 📊 7. Investigation Readiness Score
SAKSHI calculates a readiness score based on completed procedural obligations.

This helps officers understand:
- Overall investigation completeness
- Missing requirements
- Readiness before charge sheet submission

---

## 📈 8. Interactive Dashboard
Each stakeholder gets a personalized dashboard showing real-time investigation insights.

Dashboard includes:
- Active cases
- Investigation progress
- Pending actions
- Timeline
- Alerts
- AI recommendations

---

## 🌐 9. Public Case Tracking Portal
Citizens can securely track the status of their registered case without accessing confidential investigation information.

Public users can view:
- Current investigation stage
- Overall progress
- Recent updates
- Expected next step

---

## 🔒 10. Privacy & Secure Data Management
SAKSHI follows a privacy-focused design.

Features include:
- Role-based access control
- Secure authentication
- Protected investigation records
- Audit logging of procedural updates
- Restricted access to sensitive information


# 🛠️ Tech Stack

### Frontend
- React.js (Vite)
- Tailwind CSS
- React Router DOM
- React Flow (Dynamic Procedural Graph)
- Recharts
- Axios
- Lucide React

### Backend
- Node.js
- Express.js
- RESTful APIs
- JWT Authentication

### Database & Backend Services
- Supabase
- PostgreSQL
- Supabase Authentication
- Supabase Storage

### Artificial Intelligence
- Google Gemini API
- A2A (Agent-to-Agent Communication)
- Prompt Engineering

### Development Tools
- Git
- GitHub
- Visual Studio Code
- Postman
- npm

### Deployment
- Vercel (Frontend)
- Render (Backend)

| Category | Technology | Purpose |
|----------|------------|---------|
| Frontend | React.js (Vite) | Build responsive user interfaces |
| Styling | Tailwind CSS | Modern UI design |
| Routing | React Router DOM | Navigation between pages |
| Workflow Visualization | React Flow | Dynamic Procedural Obligation Graph (D-POG) |
| Charts | Recharts | Dashboard analytics and statistics |
| API Communication | Axios | Connect frontend with backend |
| Icons | Lucide React | User interface icons |
| Backend | Node.js | Server-side runtime |
| Framework | Express.js | REST API development |
| Authentication | JWT | Secure role-based authentication |
| Database | PostgreSQL (Supabase) | Store cases, users, and workflow data |
| Backend Services | Supabase | Database, authentication, and storage |
| AI | Google Gemini API | AI-powered procedural guidance |
| AI Orchestration | A2A | Agent-to-Agent communication |
| Version Control | Git & GitHub | Source code management |
| API Testing | Postman | API development and testing |
| Code Editor | Visual Studio Code | Development environment |
| Package Manager | npm | Dependency management |
| Frontend Deployment | Vercel | Deploy React application |
| Backend Deployment | Render | Deploy Express backend |

# 🕸️ Dynamic Procedural Obligation Graph (D-POG)

## What is D-POG?

The **Dynamic Procedural Obligation Graph (D-POG)** is the core intelligence engine of SAKSHI. It models the pre-court POCSO investigation process as a dynamic graph, where each node represents a mandatory procedural stage and each edge represents the dependency between investigation activities.

Unlike traditional linear workflows, D-POG continuously evaluates the procedural state of a case, identifies blocked or incomplete stages, and guides investigators toward the next legally required action.

---

## Why D-POG?

Traditional investigation tracking systems mainly display the current status of a case but do not explain **why progress has stopped** or **which procedural dependency is preventing the next step**.

D-POG solves this by visualizing the complete procedural workflow and automatically identifying dependencies, pending obligations, and investigation bottlenecks.

---

## How D-POG Works

```text
Complaint Received
        │
        ▼
FIR Registration
        │
        ▼
Victim Statement
        │
        ▼
Medical Examination
        │
        ▼
CWC Assessment
        │
        ▼
Evidence Collection
        │
        ▼
FSL Analysis
        │
        ▼
Witness Statements
        │
        ▼
Charge Sheet Preparation
        │
        ▼
Submitted to Court
```

Each stage becomes active only when all required prerequisite procedures have been completed.

---

## Key Capabilities

- ✅ Models the complete pre-court investigation workflow
- ✅ Tracks procedural dependencies between investigation stages
- ✅ Detects blocked or incomplete procedural steps
- ✅ Visualizes investigation progress in real time
- ✅ Recommends the next procedural action
- ✅ Supports AI-powered procedural guidance
- ✅ Improves coordination among Police, Hospital, CWC, and FSL

---

## Integration with AI

The D-POG works together with the Gemini AI Assistant.

The AI analyzes the current graph state to:

- Explain investigation delays
- Identify missing procedural requirements
- Recommend the next legal step
- Generate investigation summaries
- Answer procedural workflow queries

---

## Benefits

- Faster investigation coordination
- Improved procedural compliance
- Better inter-department collaboration
- Reduced investigation delays
- Enhanced transparency
- Improved decision support for investigators


# 📂 Project Structure

```text
sakshi-adaptive-procedural-intelligence/
│
├── 📁 client/                          # Frontend (React + Vite)
│   ├── 📁 public/
│   │
│   ├── 📁 src/
│   │   ├── 📁 assets/                  # Images, icons, logos
│   │   ├── 📁 components/              # Reusable UI components
│   │   ├── 📁 pages/
│   │   │   ├── Login/
│   │   │   ├── Dashboard/
│   │   │   ├── Police/
│   │   │   ├── Hospital/
│   │   │   ├── CWC/
│   │   │   ├── FSL/
│   │   │   ├── PublicPortal/
│   │   │   └── NotFound/
│   │   │
│   │   ├── 📁 layouts/
│   │   ├── 📁 services/                # API calls
│   │   ├── 📁 hooks/
│   │   ├── 📁 utils/
│   │   ├── 📁 context/
│   │   ├── 📁 routes/
│   │   ├── 📁 styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── 📁 server/                          # Backend (Node.js + Express)
│   ├── 📁 config/
│   ├── 📁 controllers/
│   ├── 📁 middleware/
│   ├── 📁 models/
│   ├── 📁 routes/
│   ├── 📁 services/
│   │   ├── aiService.js
│   │   ├── graphService.js
│   │   └── notificationService.js
│   │
│   ├── 📁 utils/
│   ├── 📁 database/
│   ├── server.js
│   └── package.json
│
├── 📁 docs/
│   ├── architecture.png
│   ├── workflow.png
│   └── screenshots/
│
├── 📁 database/
│   ├── schema.sql
│   └── sample_data.sql
│
├── 📁 .github/
│   └── workflows/
│
├── .env.example
├── .gitignore
├── README.md
└── LICENSE
```

## 📁 Folder Description

| Folder | Description |
|---------|-------------|
| `client/` | React frontend application |
| `server/` | Node.js and Express backend |
| `docs/` | Architecture diagrams, screenshots, and documentation |
| `database/` | Database schema and sample SQL scripts |
| `components/` | Reusable UI components |
| `pages/` | Role-based dashboards and application pages |
| `routes/` | API and frontend routing |
| `services/` | Business logic, AI integration, and API communication |
| `controllers/` | Backend request handlers |
| `middleware/` | Authentication and authorization |
| `config/` | Environment and application configuration |
| `utils/` | Helper functions |

# 🚀 Installation

## Prerequisites

Before running the project, ensure you have the following installed:

- Node.js (v18 or above)
- npm
- Git
- Visual Studio Code
- Supabase Account
- Google Gemini API Key

---

## Clone the Repository

```bash
git clone https://github.com/YuvasriPraksh/sakshi-adaptive-procedural-intelligence.git
```

```bash
cd sakshi-adaptive-procedural-intelligence
```

---

## Frontend Setup

```bash
cd client
```

```bash
npm install
```

```bash
npm run dev
```

The frontend will start at:

```
http://localhost:5173
```

---

## Backend Setup

Open another terminal.

```bash
cd server
```

```bash
npm install
```

Create a `.env` file and configure the following environment variables:

```env
PORT=5000

SUPABASE_URL=your_supabase_url

SUPABASE_ANON_KEY=your_supabase_anon_key

JWT_SECRET=your_secret_key

GEMINI_API_KEY=your_gemini_api_key
```

Start the backend:

```bash
npm start
```

or

```bash
npm run dev
```

The backend will run at:

```
http://localhost:5000
```

---

## Access the Application

Open your browser and visit:

```
http://localhost:5173
```

---

## Default Project Structure

```
Frontend : React + Vite
Backend  : Node.js + Express
Database : Supabase (PostgreSQL)
AI        : Google Gemini API
```

---

# 🚀 Future Enhancements

The current prototype focuses on streamlining the **pre-court POCSO investigation process**. In future versions, SAKSHI can be extended with additional capabilities to support broader investigative workflows and improve procedural intelligence.

## Planned Enhancements

- Support multiple criminal case types such as Cybercrime, Theft, Road Accidents, Domestic Violence, and Homicide.
- Real-time integration with Police, Hospital, CWC, FSL, and Court information systems.
- AI-powered procedural risk prediction and early warning alerts.
- Mobile application for field officers with offline synchronization.
- SMS, Email, and WhatsApp notifications for authorized stakeholders.
- Advanced analytics dashboard for supervisors and administrators.
- Multilingual support to improve accessibility across different regions.
- Secure document management and digital evidence tracking.
- Predictive investigation timelines using AI-based insights.
- Integration with government e-Governance platforms for seamless information exchange.

### Long-Term Vision

SAKSHI aims to evolve into a scalable procedural intelligence platform that can assist multiple agencies in managing criminal investigations efficiently while improving transparency, accountability, and coordination across the justice system.