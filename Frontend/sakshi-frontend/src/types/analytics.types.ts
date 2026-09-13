/**
 * Analytics type definitions.
 * Aligned with Backend/app/schemas/analytics.py Pydantic models.
 * Phase 2B: Introduced to support typed analyticsService.
 */

export interface KpiStats {
  totalCases: number;
  activeCases: number;
  closedCases: number;
  highRiskCases: number;
  avgInvestigationDays: number;
  pendingStages: number;
  slaCompliance: number;
  escalatedCases: number;
}

export interface MonthlyTrendPoint {
  month: string;
  registered: number;
  resolved: number;
  escalated: number;
}

export interface CrimeTypeData {
  name: string;
  value: number;
}

export interface StatusDist {
  label: string;
  value: number;
  color: string;
}

export interface RiskDist {
  label: string;
  value: number;
  color: string;
}

export interface OfficerPerformance {
  name: string;
  cases: number;
  resolved: number;
  avgDays: number;
}

export interface DepartmentCaseCount {
  dept: string;
  cases: number;
}
