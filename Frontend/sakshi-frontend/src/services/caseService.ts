/**
 * caseService — All case management & D-POG workflow API calls.
 * Phase 3: D-POG Procedural Digital Twin Engine integration.
 */
import apiClient from "./api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/common.types";
import type { InvestigationCase, WorkflowStage } from "@/types/case.types";
import type { ProceduralGraphData, StageTransitionPayload } from "@/types/dpog.types";

interface BackendCase {
  id: string;
  caseNumber: string;
  firNumber: string;
  crimeType: string;
  victimCode: string;
  victimAge: number;
  victimGender: string;
  incidentDate: string;
  incidentLocation: string;
  district: string;
  state: string;
  status?: string;
  priority?: string;
  currentStage?: string;
  currentStageOrder?: number;
  totalStages?: number;
  assignedOfficerId?: string;
  assignedOfficer?: string;
  assignedStation?: string;
  createdAt: string;
  updatedAt: string;
  remarks?: string;
  workflow?: WorkflowStage[];
  documents?: InvestigationCase["documents"];
}

function normalizeCase(raw: BackendCase, workflow: WorkflowStage[] = raw.workflow ?? []): InvestigationCase {
  return {
    ...raw,
    crimeType: (raw.crimeType.toLowerCase() === "pocso" ? "pocso" : raw.crimeType) as InvestigationCase["crimeType"],
    victimGender: raw.victimGender.toLowerCase().startsWith("f") ? "F" : "M",
    status: (raw.status === "investigation" ? "in_progress" : raw.status ?? "registered") as InvestigationCase["status"],
    priority: (raw.priority ?? "medium") as InvestigationCase["priority"],
    currentStage: raw.currentStage ?? workflow.find(stage => stage.status !== "completed")?.title ?? "Registration",
    currentStageOrder: raw.currentStageOrder ?? 1,
    totalStages: raw.totalStages ?? workflow.length,
    assignedOfficerId: raw.assignedOfficerId ?? "",
    assignedOfficer: raw.assignedOfficer ?? "Unassigned",
    assignedStation: raw.assignedStation ?? "",
    remarks: raw.remarks ?? "",
    workflow,
    documents: raw.documents ?? [],
  };
}

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
    const res = await apiClient.get<PaginatedResponse<BackendCase>>("/cases", { params: filters });
    return { ...res.data, data: res.data.data.map(item => normalizeCase(item)) };
  },

  async getById(id: string): Promise<ApiResponse<InvestigationCase>> {
    const [caseRes, workflowRes] = await Promise.all([
      apiClient.get<ApiResponse<BackendCase>>(`/cases/${id}`),
      apiClient.get<ApiResponse<WorkflowStage[]>>(`/workflow/cases/${id}`),
    ]);
    return { ...caseRes.data, data: normalizeCase(caseRes.data.data, workflowRes.data.data) };
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
