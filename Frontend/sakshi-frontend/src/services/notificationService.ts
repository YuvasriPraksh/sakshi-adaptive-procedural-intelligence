import apiClient from "./api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/common.types";
import type { AppNotification } from "@/types/ai.types";
import { DEMO_MODE, DEMO_DELAY } from "@/config/demo.config";
import { APP_NOTIFICATIONS } from "@/data/ai.data";

export const notificationService = {
  async list(): Promise<PaginatedResponse<AppNotification>> {
    if (DEMO_MODE) {
      await DEMO_DELAY(400);
      return { success: true, message: "OK", data: APP_NOTIFICATIONS, pagination: { page:1, pageSize:50, total:APP_NOTIFICATIONS.length, totalPages:1 } };
    }
    const res = await apiClient.get<PaginatedResponse<AppNotification>>("/notifications");
    return res.data;
  },

  async markRead(id: string): Promise<ApiResponse<void>> {
    if (DEMO_MODE) { await DEMO_DELAY(200); return { success: true, message: "Marked read", data: undefined }; }
    const res = await apiClient.patch<ApiResponse<void>>(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllRead(): Promise<ApiResponse<void>> {
    if (DEMO_MODE) { await DEMO_DELAY(400); return { success: true, message: "All read", data: undefined }; }
    const res = await apiClient.post<ApiResponse<void>>("/notifications/mark-all-read");
    return res.data;
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    if (DEMO_MODE) { await DEMO_DELAY(200); return { success: true, message: "Deleted", data: undefined }; }
    const res = await apiClient.delete<ApiResponse<void>>(`/notifications/${id}`);
    return res.data;
  },

  async getUnreadCount(): Promise<ApiResponse<number>> {
    if (DEMO_MODE) {
      await DEMO_DELAY(300);
      return { success: true, message: "OK", data: APP_NOTIFICATIONS.filter(n => !n.read).length };
    }
    const res = await apiClient.get<ApiResponse<number>>("/notifications/unread-count");
    return res.data;
  },
};
