export type CaseStatus = "registered" | "in_progress" | "under_review" | "completed" | "escalated" | "closed" | "pending";
export type CasePriority = "critical" | "high" | "medium" | "low";
export type CrimeType = "sexual_assault" | "child_abuse" | "trafficking" | "exploitation" | "cybercrime" | "pocso" | "other";
export type WorkflowStageStatus = "completed" | "in_progress" | "pending" | "skipped";

export interface Officer {
  id: string;
  name: string;
  designation: string;
  station: string;
  badge: string;
  phone: string;
  email: string;
  department: "police" | "hospital" | "fsl" | "cwc" | "supervisor";
  activeCases: number;
}

export interface WorkflowStage {
  id: string;
  order: number;
  title: string;
  description: string;
  status: WorkflowStageStatus;
  completedDate?: string;
  officer?: string;
  remarks?: string;
  deadline?: string;
  department: "police" | "hospital" | "fsl" | "cwc" | "court";
}

export interface CaseDocument {
  id: string;
  name: string;
  type: "fir" | "medical_report" | "fsl_report" | "witness_statement" | "evidence" | "other";
  uploadedBy: string;
  uploadedAt: string;
  size: string;
  url?: string;
}

export interface InvestigationCase {
  id: string;
  caseNumber: string;
  firNumber: string;
  crimeType: CrimeType;
  victimCode: string;
  victimAge: number;
  victimGender: "M" | "F";
  incidentDate: string;
  incidentLocation: string;
  district: string;
  state: string;
  status: CaseStatus;
  priority: CasePriority;
  currentStage: string;
  currentStageOrder: number;
  totalStages: number;
  assignedOfficerId: string;
  assignedOfficer: string;
  assignedStation: string;
  createdAt: string;
  updatedAt: string;
  remarks: string;
  workflow: WorkflowStage[];
  documents: CaseDocument[];
}
