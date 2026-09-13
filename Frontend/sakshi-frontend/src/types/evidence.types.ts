export type EvidenceType =
  | "biological"
  | "digital"
  | "physical"
  | "documentary"
  | "forensic_sample"
  | "medical_record"
  | "witness_recording"
  | "photograph"
  | "other";

export type EvidenceStatus =
  | "registered"
  | "sealed"
  | "in_transit"
  | "received"
  | "under_analysis"
  | "analysis_complete"
  | "court_submitted"
  | "returned"
  | "compromised";

export type AgencyType = "police" | "hospital" | "fsl" | "cwc" | "court";

export type CustodyAction =
  | "registered"
  | "sealed"
  | "transferred"
  | "received"
  | "examined"
  | "analyzed"
  | "hash_verified"
  | "returned"
  | "submitted_to_court"
  | "integrity_check"
  | "resealed"
  | "accessed";

export type VerificationStatus = "verified" | "pending" | "failed" | "not_checked";

export type AccessLevel = "read" | "download" | "restricted" | "full";

// ─── Core models ──────────────────────────────────────────────────────────────
export interface EvidenceItem {
  id:               string;
  evidenceId:       string;          // Human-readable: EVD-2024-XXXXXX
  caseId:           string;
  caseNumber:       string;
  type:             EvidenceType;
  description:      string;
  collectedBy:      string;
  collectedByRole:  string;
  agency:           AgencyType;
  collectionDate:   string;
  collectionTime:   string;
  gpsLocation:      string;
  gpsCoords:        { lat: number; lng: number };
  status:           EvidenceStatus;
  currentCustody:   AgencyType;
  currentOfficer:   string;
  initialHash:      string;
  currentHash:      string;
  verificationStatus: VerificationStatus;
  lastVerified?:    string;
  evidenceToken:    string;
  sealNumber:       string;
  weight?:          string;
  dimensions?:      string;
  photographs:      number;
  notes:            string;
  createdAt:        string;
  updatedAt:        string;
  chain:            CustodyEvent[];
  versions:         EvidenceVersion[];
  shares:           EvidenceShare[];
  auditLogs:        EvidenceAuditLog[];
}

export interface CustodyEvent {
  id:               string;
  eventNumber:      number;
  action:           CustodyAction;
  fromAgency?:      AgencyType;
  toAgency?:        AgencyType;
  officer:          string;
  officerRole:      string;
  agency:           AgencyType;
  timestamp:        string;
  purpose:          string;
  transferId?:      string;
  hashBefore?:      string;
  hashAfter?:       string;
  digitalSignature: string;
  verificationStatus: VerificationStatus;
  remarks:          string;
  location:         string;
}

export interface EvidenceVersion {
  id:           string;
  version:      number;
  modifiedBy:   string;
  modifiedAt:   string;
  changes:      string;
  reason:       string;
  canRollback:  boolean;
  snapshot:     string;
}

export interface EvidenceShare {
  id:           string;
  sharedBy:     string;
  sharedByAgency: AgencyType;
  sharedWith:   string;
  sharedWithAgency: AgencyType;
  sharedAt:     string;
  accessLevel:  AccessLevel;
  expiresAt?:   string;
  purpose:      string;
  isActive:     boolean;
}

export interface EvidenceAuditLog {
  id:          string;
  user:        string;
  userRole:    string;
  agency:      AgencyType;
  action:      string;
  details:     string;
  ipAddress:   string;
  timestamp:   string;
  success:     boolean;
}

export interface EvidenceTransferRequest {
  fromAgency:   AgencyType;
  toAgency:     AgencyType;
  officer:      string;
  purpose:      string;
  evidenceIds:  string[];
  notes?:       string;
}

export interface EvidenceAlert {
  id:        string;
  type:      "integrity_failure" | "missing" | "delayed_transfer" | "unauthorized_access" | "expired_verification";
  evidenceId: string;
  evidenceRef: string;
  severity:  "critical" | "high" | "medium" | "low";
  message:   string;
  timestamp: string;
  resolved:  boolean;
}

// ─── Dashboard stats ──────────────────────────────────────────────────────────
export interface EvidenceDashboardStats {
  total:              number;
  pendingVerification:number;
  verified:           number;
  sharedAcrossAgencies:number;
  inTransit:          number;
  courtSubmitted:     number;
  integrityHealth:    number; // %
  chainHealth:        number; // %
  alertCount:         number;
}
