import type { EvidenceType, EvidenceStatus, AgencyType, CustodyAction, VerificationStatus } from "@/types/evidence.types";

export const EVIDENCE_TYPE_LABEL: Record<EvidenceType, string> = {
  biological:        "Biological",
  digital:           "Digital",
  physical:          "Physical",
  documentary:       "Documentary",
  forensic_sample:   "Forensic Sample",
  medical_record:    "Medical Record",
  witness_recording: "Witness Recording",
  photograph:        "Photograph",
  other:             "Other",
};

export const EVIDENCE_STATUS_LABEL: Record<EvidenceStatus, string> = {
  registered:       "Registered",
  sealed:           "Sealed",
  in_transit:       "In Transit",
  received:         "Received",
  under_analysis:   "Under Analysis",
  analysis_complete:"Analysis Complete",
  court_submitted:  "Court Submitted",
  returned:         "Returned",
  compromised:      "Compromised",
};

export const EVIDENCE_STATUS_BADGE: Record<EvidenceStatus, "primary"|"warning"|"info"|"success"|"muted"|"danger"> = {
  registered:       "primary",
  sealed:           "info",
  in_transit:       "warning",
  received:         "info",
  under_analysis:   "warning",
  analysis_complete:"success",
  court_submitted:  "muted",
  returned:         "muted",
  compromised:      "danger",
};

export const AGENCY_LABEL: Record<AgencyType, string> = {
  police:   "Police",
  hospital: "Hospital",
  fsl:      "FSL",
  cwc:      "CWC",
  court:    "Court",
};

export const AGENCY_COLOR: Record<AgencyType, { bg: string; text: string; border: string }> = {
  police:   { bg:"bg-royal-50  dark:bg-royal-950/30",   text:"text-royal-700  dark:text-royal-300",   border:"border-royal-200  dark:border-royal-800" },
  hospital: { bg:"bg-emerald-50 dark:bg-emerald-950/30", text:"text-emerald-700 dark:text-emerald-300", border:"border-emerald-200 dark:border-emerald-800" },
  fsl:      { bg:"bg-purple-50  dark:bg-purple-950/30",  text:"text-purple-700  dark:text-purple-300",  border:"border-purple-200  dark:border-purple-800" },
  cwc:      { bg:"bg-amber-50   dark:bg-amber-950/30",   text:"text-amber-700   dark:text-amber-300",   border:"border-amber-200   dark:border-amber-800" },
  court:    { bg:"bg-slate-100  dark:bg-slate-800/50",   text:"text-slate-700   dark:text-slate-300",   border:"border-slate-200   dark:border-slate-700" },
};

export const ACTION_LABEL: Record<CustodyAction, string> = {
  registered:          "Evidence Registered",
  sealed:              "Evidence Sealed",
  transferred:         "Transferred to Agency",
  received:            "Evidence Received",
  examined:            "Medical Examination",
  analyzed:            "Forensic Analysis",
  hash_verified:       "Hash Verified",
  returned:            "Evidence Returned",
  submitted_to_court:  "Submitted to Court",
  integrity_check:     "Integrity Check",
  resealed:            "Re-sealed",
  accessed:            "Evidence Accessed",
};

export const VERIFICATION_BADGE: Record<VerificationStatus, "success"|"warning"|"danger"|"muted"> = {
  verified:    "success",
  pending:     "warning",
  failed:      "danger",
  not_checked: "muted",
};

export function truncateHash(hash: string, chars = 16): string {
  if (hash.length <= chars) return hash;
  return `${hash.slice(0, chars)}…`;
}

export function generateMockHash(): string {
  return Array.from({ length: 64 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
}
