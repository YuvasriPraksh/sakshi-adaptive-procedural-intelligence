import type { CaseStatus, CasePriority, CrimeType } from "@/types/case.types";

export const STATUS_LABEL: Record<CaseStatus, string> = {
  registered:   "Registered",
  in_progress:  "In Progress",
  under_review: "Under Review",
  completed:    "Completed",
  escalated:    "Escalated",
  closed:       "Closed",
  pending:      "Pending",
};

export const STATUS_BADGE: Record<CaseStatus, "primary"|"warning"|"info"|"success"|"danger"|"muted"> = {
  registered:   "primary",
  in_progress:  "success",
  under_review: "info",
  completed:    "muted",
  escalated:    "danger",
  closed:       "muted",
  pending:      "warning",
};

export const PRIORITY_LABEL: Record<CasePriority, string> = {
  critical: "Critical",
  high:     "High",
  medium:   "Medium",
  low:      "Low",
};

export const PRIORITY_BADGE: Record<CasePriority, "danger"|"warning"|"primary"|"muted"> = {
  critical: "danger",
  high:     "warning",
  medium:   "primary",
  low:      "muted",
};

export const CRIME_LABEL: Record<CrimeType, string> = {
  sexual_assault: "Sexual Assault",
  child_abuse:    "Child Abuse",
  trafficking:    "Trafficking",
  exploitation:   "Exploitation",
  cybercrime:     "Cybercrime",
  other:          "Other",
};

export const CRIME_TYPES: { value: CrimeType; label: string }[] = Object.entries(CRIME_LABEL).map(
  ([value, label]) => ({ value: value as CrimeType, label }),
);
