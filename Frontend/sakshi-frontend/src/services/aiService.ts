import apiClient from "./api/client";
import type { ApiResponse } from "@/types/common.types";
import type {
  AISummary,
  RiskReport,
  ReadinessReport,
  MissingProcedure,
  AIRecommendation,
  AIChatResponse,
} from "@/types/ai.types";

export const aiService = {
  async getSummary(caseId: string): Promise<ApiResponse<AISummary>> {
    const res = await apiClient.get<ApiResponse<AISummary>>(`/ai/cases/${caseId}/summary`);
    return res.data;
  },

  async getRiskReport(caseId: string): Promise<ApiResponse<RiskReport>> {
    const res = await apiClient.get<ApiResponse<RiskReport>>(`/ai/cases/${caseId}/risk`);
    return res.data;
  },

  async getReadiness(caseId: string): Promise<ApiResponse<ReadinessReport>> {
    const res = await apiClient.get<ApiResponse<ReadinessReport>>(`/ai/cases/${caseId}/readiness`);
    return res.data;
  },

  async getMissingProcedures(caseId: string): Promise<ApiResponse<MissingProcedure[]>> {
    const res = await apiClient.get<ApiResponse<MissingProcedure[]>>(`/ai/cases/${caseId}/missing`);
    return res.data;
  },

  async getRecommendations(caseId: string): Promise<ApiResponse<AIRecommendation[]>> {
    const res = await apiClient.get<ApiResponse<AIRecommendation[]>>(`/ai/cases/${caseId}/recommendations`);
    return res.data;
  },

  async chat(message: string, caseId?: string, intent?: string): Promise<ApiResponse<AIChatResponse>> {
    const res = await apiClient.post<ApiResponse<AIChatResponse>>("/ai/chat", {
      message,
      caseId: caseId || undefined,
      intent: intent || undefined,
    });
    return res.data;
  },
};
