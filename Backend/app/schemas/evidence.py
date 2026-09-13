from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class EvidenceGpsCoords(BaseModel):
    lat: float
    lng: float

    model_config = ConfigDict(from_attributes=True)


class CustodyEvent(BaseModel):
    id: str
    eventNumber: int
    action: str
    fromAgency: Optional[str] = None
    toAgency: Optional[str] = None
    officer: str
    officerRole: str
    agency: str
    timestamp: str
    purpose: str
    transferId: Optional[str] = None
    hashBefore: Optional[str] = None
    hashAfter: Optional[str] = None
    digitalSignature: str
    verificationStatus: str
    remarks: str
    location: str

    model_config = ConfigDict(from_attributes=True)


class EvidenceVersion(BaseModel):
    id: str
    version: int
    modifiedBy: str
    modifiedAt: str
    changes: str
    reason: str
    canRollback: bool
    snapshot: str

    model_config = ConfigDict(from_attributes=True)


class EvidenceShare(BaseModel):
    id: str
    sharedBy: str
    sharedByAgency: str
    sharedWith: str
    sharedWithAgency: str
    sharedAt: str
    accessLevel: str
    expiresAt: Optional[str] = None
    purpose: str
    isActive: bool

    model_config = ConfigDict(from_attributes=True)


class EvidenceAuditLog(BaseModel):
    id: str
    user: str
    userRole: str
    agency: str
    action: str
    details: str
    ipAddress: str
    timestamp: str
    success: bool

    model_config = ConfigDict(from_attributes=True)


class EvidenceItemBase(BaseModel):
    evidenceId: str
    caseId: UUID
    caseNumber: str
    type: str
    description: str
    collectedBy: str
    collectedByRole: str
    agency: str
    collectionDate: str
    collectionTime: str
    gpsLocation: str
    gpsCoords: EvidenceGpsCoords
    status: str
    currentCustody: str
    currentOfficer: str
    initialHash: str
    currentHash: str
    verificationStatus: str
    lastVerified: Optional[str] = None
    evidenceToken: str
    sealNumber: str
    weight: Optional[str] = None
    dimensions: Optional[str] = None
    photographs: int
    notes: Optional[str] = None
    chain: List[CustodyEvent] = []
    versions: List[EvidenceVersion] = []
    shares: List[EvidenceShare] = []
    auditLogs: List[EvidenceAuditLog] = []

    model_config = ConfigDict(from_attributes=True)


class EvidenceItemCreate(EvidenceItemBase):
    pass


class EvidenceItemOut(EvidenceItemBase):
    id: UUID
    createdAt: datetime
    updatedAt: datetime

    model_config = ConfigDict(from_attributes=True)


class EvidenceTransferRequest(BaseModel):
    fromAgency: str
    toAgency: str
    officer: str
    purpose: str
    evidenceIds: Optional[List[str]] = None
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class EvidenceVerifyResponse(BaseModel):
    status: str
    hashMatch: bool
    details: str

    model_config = ConfigDict(from_attributes=True)


class EvidenceAlert(BaseModel):
    id: str
    type: str
    evidenceId: str
    evidenceRef: str
    severity: str
    message: str
    timestamp: str
    resolved: bool

    model_config = ConfigDict(from_attributes=True)


class EvidenceDashboardStats(BaseModel):
    total: int
    pendingVerification: int
    verified: int
    sharedAcrossAgencies: int
    inTransit: int
    courtSubmitted: int
    integrityHealth: int
    chainHealth: int
    alertCount: int

    model_config = ConfigDict(from_attributes=True)
