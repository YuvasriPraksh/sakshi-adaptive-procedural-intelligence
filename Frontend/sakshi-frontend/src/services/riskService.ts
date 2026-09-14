import apiClient from "./api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/common.types";
import type { RiskAssessment } from "@/types/risk.types";

export const riskService = {
  async getCaseRisk(caseId: string): Promise<ApiResponse<RiskAssessment>> {
    const res = await apiClient.get<ApiResponse<RiskAssessment>>(`/risk/cases/${caseId}`);
    return res.data;
  },

  async computeRisk(caseId: string): Promise<ApiResponse<RiskAssessment>> {
    const res = await apiClient.post<ApiResponse<RiskAssessment>>(`/risk/${caseId}/compute`);
    return res.data;
  },

  async getRiskHistory(caseId: string, page = 1, pageSize = 20): Promise<PaginatedResponse<RiskAssessment>> {
    const res = await apiClient.get<PaginatedResponse<RiskAssessment>>(`/risk/${caseId}/history`, {
      params: { page, pageSize }
    });
    return res.data;
  }
};
