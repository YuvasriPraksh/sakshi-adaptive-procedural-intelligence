import uuid
from datetime import datetime
from typing import Dict, Any

from pydantic import BaseModel, ConfigDict, Field


class AccountabilityPassportBase(BaseModel):
    caseId: uuid.UUID
    caseReference: str
    generatedBy: str
    generatedById: uuid.UUID
    proceduralState: Dict[str, Any]
    obligationSummary: Dict[str, Any]
    auditVerification: Dict[str, Any]
    integrityReference: str


class AccountabilityPassportCreate(AccountabilityPassportBase):
    passportId: str
    passportHash: str


class AccountabilityPassportOut(AccountabilityPassportBase):
    id: uuid.UUID
    passportId: str
    passportHash: str
    version: int
    generatedAt: datetime
    createdAt: datetime
    updatedAt: datetime

    model_config = ConfigDict(from_attributes=True)


class PassportVerificationResult(BaseModel):
    status: str = Field(description="VERIFIED, TAMPER_DETECTED, OUTDATED, or LEGACY_DATA")
    isCurrent: bool
    details: str
    passportId: str
    caseReference: str
