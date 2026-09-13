import apiClient from "./api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/common.types";
import type { AuditEntry } from "@/data/audit.data";

export interface AuditFilters {
  module?: string;
  status?: string;
  caseId?: string;
  page?: number;
  pageSize?: number;
}

export interface ChainVerificationResult {
  valid: boolean;
  chain_length: number;
  verified_events: number;
  legacy_events: number;
  first_invalid_event_id?: string;
  failure_type?: string;
  message: string;
}

export const auditService = {
  async list(filters: AuditFilters = {}): Promise<PaginatedResponse<AuditEntry>> {
    const res = await apiClient.get<PaginatedResponse<AuditEntry>>("/audit", { params: filters });
    return res.data;
  },

  async verifyChain(scope: string): Promise<ApiResponse<ChainVerificationResult>> {
    const res = await apiClient.get<ApiResponse<ChainVerificationResult>>(`/audit/verify/${scope}`);
    return res.data;
  },
};
