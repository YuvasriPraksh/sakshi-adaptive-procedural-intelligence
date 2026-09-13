/**
 * caseService — All case management & D-POG workflow API calls.
 * Phase 3: D-POG Procedural Digital Twin Engine integration.
 */
import apiClient from "./api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/common.types";
import type { InvestigationCase, WorkflowStage } from "@/types/case.types";
import type { ProceduralGraphData, StageTransitionPayload } from "@/types/dpog.types";

export interface CaseFilters {
  status?:   string;
  priority?: string;
  officer?:  string;
  search?:   string;
  page?:     number;
  pageSize?: number;
}

export const caseService = {
  async list(filters: CaseFilters = {}): Promise<PaginatedResponse<InvestigationCase>> {
    const res = await apiClient.get<PaginatedResponse<InvestigationCase>>("/cases", { params: filters });
    return res.data;
  },

  async getById(id: string): Promise<ApiResponse<InvestigationCase>> {
    const res = await apiClient.get<ApiResponse<InvestigationCase>>(`/cases/${id}`);
    return res.data;
  },

  async create(payload: Partial<InvestigationCase>): Promise<ApiResponse<InvestigationCase>> {
    const res = await apiClient.post<ApiResponse<InvestigationCase>>("/cases", payload);
    return res.data;
  },

  async update(id: string, payload: Partial<InvestigationCase>): Promise<ApiResponse<InvestigationCase>> {
    const res = await apiClient.patch<ApiResponse<InvestigationCase>>(`/cases/${id}`, payload);
    return res.data;
  },

  async updateWorkflow(caseId: string, stage: WorkflowStage): Promise<ApiResponse<WorkflowStage>> {
    const res = await apiClient.patch<ApiResponse<WorkflowStage>>(`/cases/${caseId}/workflow/${stage.id}`, stage);
    return res.data;
  },

  async assignOfficer(caseId: string, officerId: string): Promise<ApiResponse<void>> {
    const res = await apiClient.post<ApiResponse<void>>(`/cases/${caseId}/assign`, { officerId });
    return res.data;
  },

  // ── D-POG Dynamic Procedural Obligation Graph APIs ──────────────────────────
  async getProceduralGraph(caseId: string): Promise<ApiResponse<ProceduralGraphData>> {
    const res = await apiClient.get<ApiResponse<ProceduralGraphData>>(`/cases/${caseId}/procedural-graph`);
    return res.data;
  },

  async transitionWorkflowStage(
    caseId: string,
    stageId: string,
    payload: StageTransitionPayload,
  ): Promise<ApiResponse<ProceduralGraphData>> {
    const res = await apiClient.post<ApiResponse<ProceduralGraphData>>(
      `/cases/${caseId}/workflow/${stageId}/transition`,
      payload,
    );
    return res.data;
  },
};
