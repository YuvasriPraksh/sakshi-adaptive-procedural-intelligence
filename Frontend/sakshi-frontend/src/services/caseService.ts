import apiClient from "./api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/common.types";
import type { InvestigationCase, WorkflowStage } from "@/types/case.types";
import { DEMO_MODE, DEMO_DELAY } from "@/config/demo.config";
import { CASES } from "@/data/cases.data";

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
    if (DEMO_MODE) {
      await DEMO_DELAY();
      let data = [...CASES];
      if (filters.status)   data = data.filter(c => c.status   === filters.status);
      if (filters.priority) data = data.filter(c => c.priority === filters.priority);
      if (filters.officer)  data = data.filter(c => c.assignedOfficer === filters.officer);
      if (filters.search) {
        const q = filters.search.toLowerCase();
        data = data.filter(c => c.caseNumber.toLowerCase().includes(q) || c.victimCode.toLowerCase().includes(q) || c.assignedOfficer.toLowerCase().includes(q));
      }
      const page     = filters.page     ?? 1;
      const pageSize = filters.pageSize ?? 20;
      const total    = data.length;
      return { success: true, message: "OK", data: data.slice((page-1)*pageSize, page*pageSize), pagination: { page, pageSize, total, totalPages: Math.ceil(total/pageSize) } };
    }
    const res = await apiClient.get<PaginatedResponse<InvestigationCase>>("/cases", { params: filters });
    return res.data;
  },

  async getById(id: string): Promise<ApiResponse<InvestigationCase>> {
    if (DEMO_MODE) {
      await DEMO_DELAY();
      const c = CASES.find(c => c.id === id);
      if (!c) throw { message: "Case not found", statusCode: 404 };
      return { success: true, message: "OK", data: c };
    }
    const res = await apiClient.get<ApiResponse<InvestigationCase>>(`/cases/${id}`);
    return res.data;
  },

  async create(payload: Partial<InvestigationCase>): Promise<ApiResponse<InvestigationCase>> {
    if (DEMO_MODE) {
      await DEMO_DELAY(1200);
      return { success: true, message: "Case registered", data: { ...CASES[0], ...payload, id: `c${Date.now()}` } };
    }
    const res = await apiClient.post<ApiResponse<InvestigationCase>>("/cases", payload);
    return res.data;
  },

  async update(id: string, payload: Partial<InvestigationCase>): Promise<ApiResponse<InvestigationCase>> {
    if (DEMO_MODE) {
      await DEMO_DELAY();
      const c = CASES.find(c => c.id === id);
      return { success: true, message: "Updated", data: { ...c!, ...payload } };
    }
    const res = await apiClient.patch<ApiResponse<InvestigationCase>>(`/cases/${id}`, payload);
    return res.data;
  },

  async updateWorkflow(caseId: string, stage: WorkflowStage): Promise<ApiResponse<WorkflowStage>> {
    if (DEMO_MODE) {
      await DEMO_DELAY(600);
      return { success: true, message: "Stage updated", data: stage };
    }
    const res = await apiClient.patch<ApiResponse<WorkflowStage>>(`/cases/${caseId}/workflow/${stage.id}`, stage);
    return res.data;
  },

  async assignOfficer(caseId: string, officerId: string): Promise<ApiResponse<void>> {
    if (DEMO_MODE) { await DEMO_DELAY(800); return { success: true, message: "Officer assigned", data: undefined }; }
    const res = await apiClient.post<ApiResponse<void>>(`/cases/${caseId}/assign`, { officerId });
    return res.data;
  },
};
