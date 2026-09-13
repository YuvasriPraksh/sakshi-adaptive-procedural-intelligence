/**
 * notificationService — All notification API calls.
 * Phase 2B: DEMO_MODE removed. Routes directly to FastAPI /notifications/* endpoints.
 */
import apiClient from "./api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/common.types";
import type { AppNotification } from "@/types/ai.types";

export const notificationService = {
  async list(): Promise<PaginatedResponse<AppNotification>> {
    const res = await apiClient.get<PaginatedResponse<AppNotification>>("/notifications");
    return res.data;
  },

  async markRead(id: string): Promise<ApiResponse<void>> {
    const res = await apiClient.patch<ApiResponse<void>>(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllRead(): Promise<ApiResponse<void>> {
    const res = await apiClient.post<ApiResponse<void>>("/notifications/mark-all-read");
    return res.data;
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    const res = await apiClient.delete<ApiResponse<void>>(`/notifications/${id}`);
    return res.data;
  },

  async getUnreadCount(): Promise<ApiResponse<number>> {
    const res = await apiClient.get<ApiResponse<number>>("/notifications/unread-count");
    return res.data;
  },
};
