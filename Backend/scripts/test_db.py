import asyncio
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import AsyncSessionLocal, engine
from app.models.case import Case
from sqlalchemy import select

async def test_db():
    print("Testing database connectivity and persistence...")
    try:
        async with AsyncSessionLocal() as session:
            # Query the synthetic POCSO case
            result = await session.execute(select(Case).filter_by(caseNumber="POCSO-2026-001"))
            case = result.scalar_one_or_none()
            if case:
                print(f"SUCCESS: Found case {case.caseNumber} (Current Stage: {case.currentStage})")
            else:
                print("FAILED: Case POCSO-2026-001 not found. Ensure seed_db.py has been run.")
    except Exception as e:
        print(f"FAILED: Connection or query error: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test_db())
