import { httpClient } from "../httpClient";
import type { Notification, NotificationConfig, PaginatedResponse } from "../types";

const BASE = "/api/admin/notifications";

export const notificationsService = {
  list(params?: { unread?: boolean; type?: string; page?: number }) {
    const query: Record<string, string | number | undefined> = {
      page: params?.page,
      type: params?.type,
    };
    if (params?.unread) query.unread = "true";
    return httpClient.get<PaginatedResponse<Notification>>(`${BASE}/`, query);
  },

  unreadCount() {
    return httpClient.get<{ count: number }>(`${BASE}/unread-count/`);
  },

  markRead(id: string) {
    return httpClient.patch<Notification>(`${BASE}/${id}/read/`);
  },

  markAllRead() {
    return httpClient.post<{ status: string }>(`${BASE}/mark-all-read/`);
  },

  clearRead() {
    return httpClient.delete(`${BASE}/clear-read/`);
  },

  getConfig() {
    return httpClient.get<NotificationConfig>(`${BASE}/config/`);
  },

  updateConfig(data: Partial<NotificationConfig>) {
    return httpClient.patch<NotificationConfig>(`${BASE}/config/`, data);
  },
};
