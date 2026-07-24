import apiClient from "./api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/common.types";
import type { EvidenceItem, EvidenceTransferRequest, EvidenceDashboardStats, EvidenceAlert } from "@/types/evidence.types";
import { DEMO_MODE, DEMO_DELAY } from "@/config/demo.config";
import { EVIDENCE_ITEMS } from "@/data/evidence.items";
import { EVIDENCE_STATS, EVIDENCE_ALERTS } from "@/data/evidence.data";

export const evidenceService = {
  async getStats(): Promise<ApiResponse<EvidenceDashboardStats>> {
    if (DEMO_MODE) { await DEMO_DELAY(500); return { success:true, message:"OK", data:EVIDENCE_STATS }; }
    return (await apiClient.get<ApiResponse<EvidenceDashboardStats>>("/evidence/stats")).data;
  },

  async list(filters?: { caseId?: string; status?: string; agency?: string }): Promise<PaginatedResponse<EvidenceItem>> {
    if (DEMO_MODE) {
      await DEMO_DELAY();
      let data = [...EVIDENCE_ITEMS];
      if (filters?.caseId)  data = data.filter(e => e.caseId  === filters.caseId);
      if (filters?.status)  data = data.filter(e => e.status  === filters.status);
      if (filters?.agency)  data = data.filter(e => e.agency  === filters.agency);
      return { success:true, message:"OK", data, pagination:{ page:1, pageSize:50, total:data.length, totalPages:1 } };
    }
    return (await apiClient.get<PaginatedResponse<EvidenceItem>>("/evidence", { params:filters })).data;
  },

  async getById(id: string): Promise<ApiResponse<EvidenceItem>> {
    if (DEMO_MODE) {
      await DEMO_DELAY(400);
      const item = EVIDENCE_ITEMS.find(e => e.id === id || e.evidenceId === id);
      if (!item) throw { message:"Evidence not found", statusCode:404 };
      return { success:true, message:"OK", data:item };
    }
    return (await apiClient.get<ApiResponse<EvidenceItem>>(`/evidence/${id}`)).data;
  },

  async create(payload: Partial<EvidenceItem>): Promise<ApiResponse<EvidenceItem>> {
    if (DEMO_MODE) {
      await DEMO_DELAY(1200);
      const newItem = { ...EVIDENCE_ITEMS[0], ...payload, id:`e${Date.now()}`, evidenceId:`EVD-${Date.now()}`, chain:[], versions:[], shares:[], auditLogs:[] };
      return { success:true, message:"Evidence registered", data:newItem };
    }
    return (await apiClient.post<ApiResponse<EvidenceItem>>("/evidence", payload)).data;
  },

  async transfer(id: string, req: EvidenceTransferRequest): Promise<ApiResponse<EvidenceItem>> {
    if (DEMO_MODE) {
      await DEMO_DELAY(800);
      const item = EVIDENCE_ITEMS.find(e => e.id === id || e.evidenceId === id) ?? EVIDENCE_ITEMS[0];
      const transferEvent = {
        id:               `trf-${Date.now()}`,
        eventNumber:      item.chain.length + 1,
        action:           "transferred" as const,
        agency:           item.currentCustody,
        officer:          req.officer,
        officerRole:      "Custody Officer",
        timestamp:        new Date().toISOString(),
        purpose:          req.purpose,
        fromAgency:       item.currentCustody,
        toAgency:         req.toAgency,
        transferId:       `TRF-${new Date().getFullYear()}-${Math.floor(Math.random()*900+100)}`,
        hashBefore:       item.currentHash,
        hashAfter:        item.currentHash,
        digitalSignature: `SIG-${req.officer.replace(/\s+/g, "").slice(0,6).toUpperCase()}-${Date.now()}`,
        verificationStatus:"verified",
        remarks:          "Secure transfer completed with chain-of-custody seal.",
        location:         `${AGENCY_LABEL[req.toAgency]} Central`,
      };
      const updated: EvidenceItem = {
        ...item,
        currentCustody: req.toAgency,
        currentOfficer: req.officer,
        status: "in_transit",
        updatedAt: new Date().toISOString(),
        chain: [...item.chain, transferEvent],
        auditLogs: [...item.auditLogs, {
          id: `al-${Date.now()}`,
          user: req.officer,
          userRole: "Custody Officer",
          agency: item.currentCustody,
          action: "Transfer Started",
          details: `Transfer to ${req.toAgency} initiated with ID ${transferEvent.transferId}.`,
          ipAddress: "192.168.100.12",
          timestamp: new Date().toISOString(),
          success: true,
        }],
      };
      return { success:true, message:"Transfer initiated", data:updated };
    }
    return (await apiClient.post<ApiResponse<EvidenceItem>>(`/evidence/${id}/transfer`, req)).data;
  },

  async verifyIntegrity(id: string): Promise<ApiResponse<{ status:"verified"|"failed"; hashMatch:boolean; details:string }>> {
    if (DEMO_MODE) {
      await DEMO_DELAY(1500);
      const item = EVIDENCE_ITEMS.find(e => e.id === id);
      const match = item ? item.initialHash === item.currentHash : false;
      return { success:true, message:"Verification complete", data:{ status:match?"verified":"failed", hashMatch:match, details:match?"SHA-256 hashes match. Evidence integrity confirmed.":"HASH MISMATCH DETECTED. Evidence may have been tampered." } };
    }
    return (await apiClient.post<ApiResponse<{ status:"verified"|"failed"; hashMatch:boolean; details:string }>>(`/evidence/${id}/verify`)).data;
  },

  async getAlerts(): Promise<ApiResponse<EvidenceAlert[]>> {
    if (DEMO_MODE) { await DEMO_DELAY(400); return { success:true, message:"OK", data:EVIDENCE_ALERTS }; }
    return (await apiClient.get<ApiResponse<EvidenceAlert[]>>("/evidence/alerts")).data;
  },
};
