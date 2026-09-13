import apiClient from "./api/client";
import type { ApiResponse } from "@/types/common.types";
import type { AISummary, RiskReport, ReadinessReport, MissingProcedure, AIRecommendation } from "@/types/ai.types";
import { DEMO_MODE, DEMO_DELAY } from "@/config/demo.config";
import { CASE_AI_SUMMARIES, RISK_REPORTS, READINESS_REPORTS, MISSING_PROCEDURES, AI_RECOMMENDATIONS, AI_RESPONSES } from "@/data/ai.data";

export const aiService = {
  async getSummary(caseId: string): Promise<ApiResponse<AISummary>> {
    if (DEMO_MODE) {
      await DEMO_DELAY(900);
      const s = CASE_AI_SUMMARIES.find(s => s.caseId === caseId) ?? CASE_AI_SUMMARIES[0];
      return { success: true, message: "OK", data: s };
    }
    const res = await apiClient.get<ApiResponse<AISummary>>(`/ai/cases/${caseId}/summary`);
    return res.data;
  },

  async getRiskReport(caseId: string): Promise<ApiResponse<RiskReport>> {
    if (DEMO_MODE) {
      await DEMO_DELAY(800);
      const r = RISK_REPORTS.find(r => r.caseId === caseId) ?? RISK_REPORTS[0];
      return { success: true, message: "OK", data: r };
    }
    const res = await apiClient.get<ApiResponse<RiskReport>>(`/ai/cases/${caseId}/risk`);
    return res.data;
  },

  async getReadiness(caseId: string): Promise<ApiResponse<ReadinessReport>> {
    if (DEMO_MODE) {
      await DEMO_DELAY(700);
      const r = READINESS_REPORTS.find(r => r.caseId === caseId) ?? READINESS_REPORTS[0];
      return { success: true, message: "OK", data: r };
    }
    const res = await apiClient.get<ApiResponse<ReadinessReport>>(`/ai/cases/${caseId}/readiness`);
    return res.data;
  },

  async getMissingProcedures(caseId: string): Promise<ApiResponse<MissingProcedure[]>> {
    if (DEMO_MODE) {
      await DEMO_DELAY(600);
      return { success: true, message: "OK", data: MISSING_PROCEDURES.filter(m => m.caseId === caseId) };
    }
    const res = await apiClient.get<ApiResponse<MissingProcedure[]>>(`/ai/cases/${caseId}/missing`);
    return res.data;
  },

  async getRecommendations(caseId: string): Promise<ApiResponse<AIRecommendation[]>> {
    if (DEMO_MODE) {
      await DEMO_DELAY(600);
      return { success: true, message: "OK", data: AI_RECOMMENDATIONS.filter(r => r.caseId === caseId) };
    }
    const res = await apiClient.get<ApiResponse<AIRecommendation[]>>(`/ai/cases/${caseId}/recommendations`);
    return res.data;
  },

  async chat(message: string, _caseId?: string): Promise<ApiResponse<string>> {
    if (DEMO_MODE) {
      await DEMO_DELAY(900 + Math.random() * 600);
      const q = message.toLowerCase();
      let response = AI_RESPONSES.default;
      if (q.includes("summar"))                      response = AI_RESPONSES.summarize;
      else if (q.includes("next"))                   response = AI_RESPONSES["next step"];
      else if (q.includes("missing"))                response = AI_RESPONSES.missing;
      else if (q.includes("delay") || q.includes("why")) response = AI_RESPONSES.delay;
      else if (q.includes("document"))               response = AI_RESPONSES.documents;
      else if (q.includes("recommend"))              response = AI_RESPONSES.recommendations;
      else if (q.includes("risk"))                   response = AI_RESPONSES.risk;
      else if (q.includes("ready") || q.includes("court")) response = AI_RESPONSES.readiness;
      else if (q.includes("assign") || q.includes("officer")) response = AI_RESPONSES.assign;
      else if (q.includes("analytic") || q.includes("timeline")) response = AI_RESPONSES.analytics;
      return { success: true, message: "OK", data: response };
    }
    const res = await apiClient.post<ApiResponse<string>>("/ai/chat", { message, caseId: _caseId });
    return res.data;
  },
};
