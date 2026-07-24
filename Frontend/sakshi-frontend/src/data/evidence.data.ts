import type { EvidenceItem, EvidenceAlert, EvidenceDashboardStats } from "@/types/evidence.types";

export const EVIDENCE_STATS: EvidenceDashboardStats = {
  total: 47,
  pendingVerification: 8,
  verified: 31,
  sharedAcrossAgencies: 22,
  inTransit: 4,
  courtSubmitted: 9,
  integrityHealth: 94,
  chainHealth: 97,
  alertCount: 3,
};

export const EVIDENCE_ALERTS: EvidenceAlert[] = [
  { id:"al1", type:"integrity_failure",    evidenceId:"e1", evidenceRef:"EVD-2024-001842-01", severity:"critical", message:"Hash mismatch detected on EVD-2024-001842-01. Evidence may have been tampered.", timestamp:"2024-02-20T11:30:00Z", resolved:false },
  { id:"al2", type:"delayed_transfer",     evidenceId:"e3", evidenceRef:"EVD-2024-001837-01", severity:"high",     message:"Transfer from FSL to Police overdue by 48 hours. SLA breach on EVD-2024-001837-01.", timestamp:"2024-02-19T09:00:00Z", resolved:false },
  { id:"al3", type:"expired_verification", evidenceId:"e4", evidenceRef:"EVD-2024-001835-02", severity:"medium",   message:"Integrity verification expired for EVD-2024-001835-02. Re-verification required.", timestamp:"2024-02-18T14:00:00Z", resolved:false },
  { id:"al4", type:"unauthorized_access",  evidenceId:"e2", evidenceRef:"EVD-2024-001841-01", severity:"high",     message:"Unauthorized access attempt on EVD-2024-001841-01 from IP 203.45.67.89.", timestamp:"2024-02-17T22:15:00Z", resolved:true  },
];
