from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.case import Case
from app.schemas.passport import AccountabilityPassportOut, PassportVerificationResult
from app.services import passport_service

router = APIRouter()


@router.post("/generate", response_model=AccountabilityPassportOut, status_code=status.HTTP_201_CREATED)
async def generate_passport(
    caseId: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate a new Accountability Passport for a specific case.
    """
    # Verify case exists and user has access (basic check)
    stmt = select(Case).where(Case.id == caseId)
    result = await db.execute(stmt)
    case = result.scalars().first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    try:
        passport = await passport_service.generate_passport(
            db=db,
            case_id=caseId,
            generated_by=current_user.name,
            generated_by_id=current_user.id,
        )
        return passport
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error generating passport")


@router.get("/case/{case_id}", response_model=List[AccountabilityPassportOut])
async def get_passports_for_case(
    case_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List all passports historically generated for a case.
    """
    return await passport_service.get_passports_for_case(db, case_id)


@router.get("/{passport_id}", response_model=AccountabilityPassportOut)
async def get_passport(
    passport_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve a specific passport.
    """
    passport = await passport_service.get_passport(db, passport_id)
    if not passport:
        raise HTTPException(status_code=404, detail="Passport not found")
    return passport


@router.get("/{passport_id}/verify", response_model=PassportVerificationResult)
async def verify_passport(
    passport_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Perform cryptographic and staleness verification of a passport.
    """
    try:
        result = await passport_service.verify_passport(db, passport_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error verifying passport")
