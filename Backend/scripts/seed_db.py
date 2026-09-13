import asyncio
import uuid
import sys
import os
from datetime import datetime, timezone

# Add the parent directory to the python path so 'app' can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import AsyncSessionLocal, init_db, engine
from app.models.user import User, UserProfile
from app.models.role import Role
from app.models.case import Case
from app.models.workflow import Workflow
from sqlalchemy import select

async def seed_data():
    await init_db()
    
    async with AsyncSessionLocal() as session:
        try:
            # 1. Seed Roles
            roles_to_create = ["admin", "police", "hospital", "fsl", "cwc", "supervisor"]
            for role_name in roles_to_create:
                result = await session.execute(select(Role).filter_by(name=role_name))
                if not result.scalar_one_or_none():
                    session.add(Role(name=role_name, description=f"{role_name.capitalize()} Role"))
                    print(f"Created role: {role_name}")
            
            await session.commit()
            
            # Fetch roles for assignment
            roles_result = await session.execute(select(Role))
            roles = {role.name: role for role in roles_result.scalars().all()}
            
            # 2. Seed Users
            users_data = [
                ("admin@sakshi.local", "Admin User", roles.get("admin")),
                ("officer@sakshi.local", "IO Sharma", roles.get("police")),
                ("doctor@sakshi.local", "Dr. Gupta", roles.get("hospital")),
                ("fsl@sakshi.local", "Analyst Verma", roles.get("fsl")),
                ("cwc@sakshi.local", "CWC Member", roles.get("cwc")),
                ("supervisor@sakshi.local", "DCP Singh", roles.get("supervisor")),
            ]
            
            for email, full_name, role in users_data:
                result = await session.execute(select(User).filter_by(email=email))
                user = result.scalar_one_or_none()
                if not user:
                    user_id = uuid.uuid4()
                    new_user = User(
                        id=user_id,
                        email=email,
                        name=full_name,
                        passwordHash="hashed_mock_password",
                        role=role.name if role else "police",
                        roleId=role.id if role else None
                    )
                    profile = UserProfile(
                        userId=user_id,
                        department=role.name if role else "police"
                    )
                    session.add(new_user)
                    session.add(profile)
                    print(f"Created user: {email}")
            
            await session.commit()

            # 3. Seed POCSO Case
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
                    currentStage="FSL Report Pending",
                    currentStageOrder=4,
                    totalStages=10,
                    remarks="Synthetic demo case for Phase 2A"
                )
                session.add(pocso_case)
                await session.flush()
                print(f"Created case: {case_number}")
                
                # 4. Seed Workflow for Case
                workflows = [
                    {"title": "FIR Registered", "status": "completed", "order": 1},
                    {"title": "Case Intake", "status": "completed", "order": 2},
                    {"title": "Medical Examination", "status": "completed", "order": 3},
                    {"title": "Evidence Collection", "status": "completed", "order": 4},
                    {"title": "FSL Report", "status": "pending", "order": 5},
                    {"title": "Evidence Review", "status": "blocked", "order": 6},
                    {"title": "Prosecution Readiness", "status": "pending", "order": 7},
                ]
                
                for wf in workflows:
                    session.add(Workflow(
                        caseId=pocso_case.id,
                        stageId=f"stage_{wf['order']}",
                        title=wf['title'],
                        description=f"Description for {wf['title']}",
                        status=wf['status'],
                        order=wf['order']
                    ))
                print(f"Created workflows for case {case_number}")

            await session.commit()
            print("Database seeded successfully.")

        except Exception as e:
            await session.rollback()
            print(f"Error during seeding: {e}")
        finally:
            await engine.dispose()

if __name__ == "__main__":
    asyncio.run(seed_data())
