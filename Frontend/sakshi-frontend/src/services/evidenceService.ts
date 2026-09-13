/**
 * evidenceService — All evidence management API calls.
 * Phase 2B: DEMO_MODE removed. Routes directly to FastAPI /evidence/* endpoints.
 */
import apiClient from "./api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/common.types";
import type { EvidenceItem, EvidenceTransferRequest, EvidenceDashboardStats, EvidenceAlert } from "@/types/evidence.types";

export const evidenceService = {
  async getStats(): Promise<ApiResponse<EvidenceDashboardStats>> {
    return (await apiClient.get<ApiResponse<EvidenceDashboardStats>>("/evidence/stats")).data;
  },

  async list(filters?: { caseId?: string; status?: string; agency?: string }): Promise<PaginatedResponse<EvidenceItem>> {
    return (await apiClient.get<PaginatedResponse<EvidenceItem>>("/evidence", { params: filters })).data;
  },

  async getById(id: string): Promise<ApiResponse<EvidenceItem>> {
    return (await apiClient.get<ApiResponse<EvidenceItem>>(`/evidence/${id}`)).data;
  },

  async create(payload: Partial<EvidenceItem>): Promise<ApiResponse<EvidenceItem>> {
    return (await apiClient.post<ApiResponse<EvidenceItem>>("/evidence", payload)).data;
  },

  async transfer(id: string, req: EvidenceTransferRequest): Promise<ApiResponse<EvidenceItem>> {
    return (await apiClient.post<ApiResponse<EvidenceItem>>(`/evidence/${id}/transfer`, req)).data;
  },

  async verifyIntegrity(id: string): Promise<ApiResponse<{ status: "verified" | "failed"; hashMatch: boolean; details: string }>> {
    return (await apiClient.post<ApiResponse<{ status: "verified" | "failed"; hashMatch: boolean; details: string }>>(`/evidence/${id}/verify`)).data;
  },

  async getAlerts(): Promise<ApiResponse<EvidenceAlert[]>> {
    return (await apiClient.get<ApiResponse<EvidenceAlert[]>>("/evidence/alerts")).data;
  },
};
