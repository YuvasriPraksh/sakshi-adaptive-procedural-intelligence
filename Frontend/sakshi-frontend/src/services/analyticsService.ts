import apiClient from "./api/client";
import type { ApiResponse } from "@/types/common.types";
import { DEMO_MODE, DEMO_DELAY } from "@/config/demo.config";
import { MONTHLY_TREND, CRIME_TYPE_DATA, STATUS_DIST, RISK_DIST, READINESS_DIST, OFFICER_PERF, DEPT_CASES, KPI_STATS } from "@/data/analytics.data";

export const analyticsService = {
  async getKpis(): Promise<ApiResponse<typeof KPI_STATS>> {
    if (DEMO_MODE) { await DEMO_DELAY(); return { success: true, message: "OK", data: KPI_STATS }; }
    const res = await apiClient.get<ApiResponse<typeof KPI_STATS>>("/analytics/kpis");
    return res.data;
  },

  async getMonthlyTrend(): Promise<ApiResponse<typeof MONTHLY_TREND>> {
    if (DEMO_MODE) { await DEMO_DELAY(); return { success: true, message: "OK", data: MONTHLY_TREND }; }
    const res = await apiClient.get<ApiResponse<typeof MONTHLY_TREND>>("/analytics/monthly-trend");
    return res.data;
  },

  async getCrimeTypeData(): Promise<ApiResponse<typeof CRIME_TYPE_DATA>> {
    if (DEMO_MODE) { await DEMO_DELAY(); return { success: true, message: "OK", data: CRIME_TYPE_DATA }; }
    const res = await apiClient.get<ApiResponse<typeof CRIME_TYPE_DATA>>("/analytics/crime-types");
    return res.data;
  },

  async getStatusDist(): Promise<ApiResponse<typeof STATUS_DIST>> {
    if (DEMO_MODE) { await DEMO_DELAY(); return { success: true, message: "OK", data: STATUS_DIST }; }
    const res = await apiClient.get<ApiResponse<typeof STATUS_DIST>>("/analytics/status-dist");
    return res.data;
  },

  async getRiskDist(): Promise<ApiResponse<typeof RISK_DIST>> {
    if (DEMO_MODE) { await DEMO_DELAY(); return { success: true, message: "OK", data: RISK_DIST }; }
    const res = await apiClient.get<ApiResponse<typeof RISK_DIST>>("/analytics/risk-dist");
    return res.data;
  },

  async getOfficerPerf(): Promise<ApiResponse<typeof OFFICER_PERF>> {
    if (DEMO_MODE) { await DEMO_DELAY(); return { success: true, message: "OK", data: OFFICER_PERF }; }
    const res = await apiClient.get<ApiResponse<typeof OFFICER_PERF>>("/analytics/officer-performance");
    return res.data;
  },

  async getDeptCases(): Promise<ApiResponse<typeof DEPT_CASES>> {
    if (DEMO_MODE) { await DEMO_DELAY(); return { success: true, message: "OK", data: DEPT_CASES }; }
    const res = await apiClient.get<ApiResponse<typeof DEPT_CASES>>("/analytics/department-cases");
    return res.data;
  },

  async getReadinessDist(): Promise<ApiResponse<typeof READINESS_DIST>> {
    if (DEMO_MODE) { await DEMO_DELAY(); return { success: true, message: "OK", data: READINESS_DIST }; }
    const res = await apiClient.get<ApiResponse<typeof READINESS_DIST>>("/analytics/readiness-dist");
    return res.data;
  },
};
