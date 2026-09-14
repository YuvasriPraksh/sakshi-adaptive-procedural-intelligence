export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface RiskFactor {
  id: string;       // e.g. "readiness", "deadline", "stall", "dependency"
  factor: string;   // human label, e.g. "Readiness", "Deadline"
  impact: string;   // numeric score as string (0-100), coerced by Pydantic
  description: string;
}

export interface RiskAssessment {
  id: string;
  caseId: string;
  riskLevel: RiskLevel;
  riskScore: number;
  riskFactors: RiskFactor[];
  summary: string;
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
}
