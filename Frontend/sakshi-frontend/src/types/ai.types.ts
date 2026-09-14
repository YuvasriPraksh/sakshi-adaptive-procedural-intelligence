export type MessageRole = "user" | "assistant" | "system";
export type RiskLevel   = "low" | "medium" | "high" | "critical";

export interface AIChatResponse {
  summary: string;
  observations: string[];
  recommendations: string[];
  basis: string[];
  uncertainties: string[];
  missingInformation: string[];
  humanApprovalRequired: boolean;
  formattedText?: string;
}

export interface ChatMessage {
  id:           string;
  role:         MessageRole;
  content:      string;
  timestamp:    Date;
  typing?:      boolean;
  copilotData?: AIChatResponse;
}

export interface AISummary {
  caseId:          string;
  caseNumber?:     string;
  summary:         string;
  currentStage:    string;
  investigationStatus: "on_track" | "delayed" | "critical" | "completed";
  pendingTasks:    string[];
  missingDocuments:string[];
  delayReasons:    string[];
  suggestedNextStep: string;
  generatedAt:     string;
}

export interface RiskFactor {
  id:          string;
  factor:      string;
  impact:      "low" | "medium" | "high";
  description: string;
}

export interface RiskReport {
  caseId:      string;
  riskLevel:   RiskLevel;
  riskScore:   number;
  riskFactors: RiskFactor[];
  summary:     string;
  generatedAt: string;
}

export interface ReadinessItem {
  id:       string;
  label:    string;
  done:     boolean;
  priority: "required" | "recommended" | "optional";
  category: "document" | "procedure" | "approval" | "evidence";
}

export interface ReadinessReport {
  caseId:         string;
  overallPercent: number;
  completedCount: number;
  totalCount:     number;
  items:          ReadinessItem[];
  recommendations:string[];
  generatedAt:    string;
}

export interface MissingProcedure {
  id:              string;
  type:            "workflow_step" | "overdue_task" | "missing_evidence" | "missing_document" | "delayed_approval";
  title:           string;
  description:     string;
  priority:        "critical" | "high" | "medium" | "low";
  suggestedAction: string;
  daysOverdue?:    number;
  caseId:          string;
}

export interface AIRecommendation {
  id:              string;
  title:           string;
  description:     string;
  priority:        "critical" | "high" | "medium" | "low";
  category:        "procedure" | "document" | "coordination" | "legal" | "evidence";
  suggestedAction: string;
  caseId:          string;
  deadline?:       string;
}

export interface AppNotification {
  id:        string;
  type:      "case_assigned" | "workflow_updated" | "high_risk" | "deadline" | "ai_recommendation" | "document_uploaded" | "escalation" | "general" | "risk";
  title:     string;
  message:   string;
  priority:  "critical" | "high" | "medium" | "low";
  read:      boolean;
  caseId?:   string;
  caseNumber?: string;
  createdAt: Date | string;
  actionUrl?: string;
  category?: string;
  eventCode?: string;
  detailsJson?: Record<string, any>;
}
