"""
seed_db.py — Development database seed script.

Idempotently seeds:
  - Roles: admin, police, hospital, fsl, cwc, supervisor
  - Demo Users with bcrypt-hashed passwords via hash_password() from app.core.security
  - One synthetic POCSO case with workflow stages

Demo password for ALL seeded users (development only): SAKSHI@Demo2026
Do NOT use this password in production and do NOT put it in frontend code.
"""
import asyncio
import uuid
import sys
import os
from datetime import datetime, timezone

# Allow importing the 'app' package from the Backend root
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import AsyncSessionLocal, init_db, engine
from app.core.security import hash_password, verify_password
from app.models.user import User, UserProfile
from app.models.role import Role
from app.models.case import Case
from app.models.workflow import Workflow
from sqlalchemy import select

# ── Development-only demo password ────────────────────────────────────────────
DEMO_PASSWORD = "SAKSHI@Demo2026"

ROLES_TO_CREATE = ["admin", "police", "hospital", "fsl", "cwc", "supervisor"]

USERS_DATA = [
    ("admin@sakshi.local",      "Admin User",      "admin"),
    ("officer@sakshi.local",    "IO Sharma",       "police"),
    ("doctor@sakshi.local",     "Dr. Gupta",       "hospital"),
    ("fsl@sakshi.local",        "Analyst Verma",   "fsl"),
    ("cwc@sakshi.local",        "CWC Member",      "cwc"),
    ("supervisor@sakshi.local", "DCP Singh",       "supervisor"),
    ("admin@sakshi.gov.in",      "Admin User",      "admin"),
    ("officer@sakshi.gov.in",    "IO Sharma",       "police"),
    ("doctor@sakshi.gov.in",     "Dr. Gupta",       "hospital"),
    ("fsl@sakshi.gov.in",        "Analyst Verma",   "fsl"),
    ("cwc@sakshi.gov.in",        "CWC Member",      "cwc"),
    ("supervisor@sakshi.gov.in", "DCP Singh",       "supervisor"),
]


async def seed_data():
    await init_db()

    async with AsyncSessionLocal() as session:
        try:
            # ── 1. Roles ──────────────────────────────────────────────────────
            print("Seeding roles...")
            for role_name in ROLES_TO_CREATE:
                result = await session.execute(select(Role).filter_by(name=role_name))
                if not result.scalar_one_or_none():
                    session.add(Role(name=role_name, description=f"{role_name.capitalize()} Role"))
                    print(f"  [+] Created role: {role_name}")
                else:
                    print(f"  [=] Role exists:  {role_name}")
            await session.commit()

            # Fetch roles for ID lookup
            roles_result = await session.execute(select(Role))
            roles = {r.name: r for r in roles_result.scalars().all()}

            # ── 2. Hash password once (bcrypt is intentionally slow) ───────────
            print("\nHashing demo password with bcrypt...")
            hashed = hash_password(DEMO_PASSWORD)
            print(f"  Hash generated (length={len(hashed)})")

            # ── 3. Users ──────────────────────────────────────────────────────
            print("\nSeeding users...")
            for email, full_name, role_name in USERS_DATA:
                role = roles.get(role_name)
                result = await session.execute(select(User).filter_by(email=email))
                existing = result.scalar_one_or_none()

                if not existing:
                    user_id = uuid.uuid4()
                    new_user = User(
                        id=user_id,
                        email=email,
                        name=full_name,
                        passwordHash=hashed,
                        role=role_name,
                        roleId=role.id if role else None,
                    )
                    profile = UserProfile(
                        userId=user_id,
                        department=role_name,
                    )
                    session.add(new_user)
                    session.add(profile)
                    print(f"  [+] Created user: {email}")
                else:
                    # Idempotent: fix the placeholder hash if it was never properly set
                    if not existing.passwordHash.startswith("$2b$") and not existing.passwordHash.startswith("$2a$"):
                        existing.passwordHash = hashed
                        print(f"  [~] Updated hash for: {email}")
                    else:
                        print(f"  [=] User exists (hash OK): {email}")

            await session.commit()

            # ── 4. POCSO Case ─────────────────────────────────────────────────
            print("\nSeeding POCSO case...")
            case_number = "POCSO-2026-001"
            result = await session.execute(select(Case).filter_by(caseNumber=case_number))
            pocso_case = result.scalar_one_or_none()

            if not pocso_case:
                pocso_case = Case(
                    caseNumber=case_number,
                    firNumber="FIR/2026/089",
                    crimeType="POCSO",
                    victimCode="V-892",
                    victimAge=14,
                    victimGender="Female",
                    incidentDate=datetime.now(timezone.utc).isoformat(),
                    incidentLocation="Sector 42, City",
                    district="Central District",
                    state="State",
                    status="investigation",
                    priority="high",
                    currentStage="FSL Analysis & Forensic Report",
                    currentStageOrder=6,
                    totalStages=9,
                    remarks="Synthetic POCSO investigation case for D-POG digital twin demonstration",
                )
                session.add(pocso_case)
                await session.flush()
                print(f"  [+] Created case: {case_number}")
            else:
                pocso_case.totalStages = 9
                pocso_case.currentStage = "FSL Analysis & Forensic Report"
                pocso_case.currentStageOrder = 6
                print(f"  [=] Case exists: {case_number}")

            # 9-Stage POCSO D-POG Standard Template Seed
            from app.core.dpog_templates import POCSO_TEMPLATE
            existing_wf_res = await session.execute(select(Workflow).filter_by(caseId=pocso_case.id))
            existing_wfs = {w.stageId: w for w in existing_wf_res.scalars().all()}

            initial_status_map = {
                "stage_1": ("completed", "IO Sharma", datetime.now(timezone.utc).isoformat()),
                "stage_2": ("completed", "CWC Member", datetime.now(timezone.utc).isoformat()),
                "stage_3": ("completed", "Dr. Gupta", datetime.now(timezone.utc).isoformat()),
                "stage_4": ("completed", "IO Sharma", datetime.now(timezone.utc).isoformat()),
                "stage_5": ("completed", "IO Sharma", datetime.now(timezone.utc).isoformat()),
                "stage_6": ("in_progress", "Analyst Verma", None),
                "stage_7": ("pending", None, None),
                "stage_8": ("pending", None, None),
                "stage_9": ("pending", None, None),
            }

            for t_stg in POCSO_TEMPLATE["stages"]:
                s_id = t_stg["stageId"]
                status, officer, comp_date = initial_status_map.get(s_id, ("pending", None, None))
                if s_id in existing_wfs:
                    wf = existing_wfs[s_id]
                    wf.title = t_stg["title"]
                    wf.description = t_stg["description"]
                    wf.order = t_stg["order"]
                    wf.department = t_stg["department"]
                    wf.deadline = t_stg.get("deadlineLabel")
                    wf.status = status
                    wf.officer = officer
                    wf.completedDate = comp_date
                else:
                    wf = Workflow(
                        caseId=pocso_case.id,
                        stageId=s_id,
                        order=t_stg["order"],
                        title=t_stg["title"],
                        description=t_stg["description"],
                        department=t_stg["department"],
                        deadline=t_stg.get("deadlineLabel"),
                        status=status,
                        officer=officer,
                        completedDate=comp_date,
                    )
                    session.add(wf)
            print(f"  [+] Synchronized 9 standard D-POG procedural stages for {case_number}")
            await session.commit()

            # ── 5. Inline verification ────────────────────────────────────────
            print("\nVerifying password hash for officer@sakshi.local ...")
            result = await session.execute(select(User).filter_by(email="officer@sakshi.local"))
            verify_user = result.scalar_one_or_none()
            if verify_user:
                ok = verify_password(DEMO_PASSWORD, verify_user.passwordHash)
                status = "PASS [OK]" if ok else "FAIL [!!]"
                print(f"  verify_password() -> {status}")
                if not ok:
                    raise RuntimeError("Password verification failed after seeding!")
            else:
                raise RuntimeError("officer@sakshi.local not found after seeding!")

            print("\nDatabase seeded successfully.")

        except Exception as e:
            await session.rollback()
            print(f"\nError during seeding: {e}")
            raise
        finally:
            await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed_data())
