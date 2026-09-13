/**
 * analyticsService — All analytics/dashboard API calls.
 * Phase 2B: DEMO_MODE removed. Routes directly to FastAPI /analytics/* endpoints.
 * Backend analytics/router.py serves static stubs — these will be replaced with
 * database-driven aggregations in a future phase.
 */
import apiClient from "./api/client";
import type { ApiResponse } from "@/types/common.types";
import type {
  KpiStats,
  MonthlyTrendPoint,
  CrimeTypeData,
  StatusDist,
  RiskDist,
  OfficerPerformance,
  DepartmentCaseCount,
} from "@/types/analytics.types";

export const analyticsService = {
  async getKpis(): Promise<ApiResponse<KpiStats>> {
    const res = await apiClient.get<ApiResponse<KpiStats>>("/analytics/kpis");
    return res.data;
  },

  async getMonthlyTrend(): Promise<ApiResponse<MonthlyTrendPoint[]>> {
    const res = await apiClient.get<ApiResponse<MonthlyTrendPoint[]>>("/analytics/monthly-trend");
    return res.data;
  },

  async getCrimeTypeData(): Promise<ApiResponse<CrimeTypeData[]>> {
    const res = await apiClient.get<ApiResponse<CrimeTypeData[]>>("/analytics/crime-types");
    return res.data;
  },

  async getStatusDist(): Promise<ApiResponse<StatusDist[]>> {
    const res = await apiClient.get<ApiResponse<StatusDist[]>>("/analytics/status-dist");
    return res.data;
  },

  async getRiskDist(): Promise<ApiResponse<RiskDist[]>> {
    const res = await apiClient.get<ApiResponse<RiskDist[]>>("/analytics/risk-dist");
    return res.data;
  },

  async getOfficerPerf(): Promise<ApiResponse<OfficerPerformance[]>> {
    const res = await apiClient.get<ApiResponse<OfficerPerformance[]>>("/analytics/officer-performance");
    return res.data;
  },

  async getDeptCases(): Promise<ApiResponse<DepartmentCaseCount[]>> {
    const res = await apiClient.get<ApiResponse<DepartmentCaseCount[]>>("/analytics/department-cases");
    return res.data;
  },

  async getReadinessDist(): Promise<ApiResponse<StatusDist[]>> {
    const res = await apiClient.get<ApiResponse<StatusDist[]>>("/analytics/readiness-dist");
    return res.data;
  },
};
