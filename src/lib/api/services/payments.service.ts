import { httpClient } from "../httpClient";
import type { Payment, GatewayConfig, PaginatedResponse, QueryParams } from "../types";

export const paymentsAdmin = {
  list(params?: QueryParams) {
    return httpClient.get<PaginatedResponse<Payment>>("/api/admin/payments/", params);
  },
  getById(id: string) {
    return httpClient.get<Payment>(`/api/admin/payments/${id}/`);
  },
  updateStatus(id: string, data: { status: string; notes?: string }) {
    return httpClient.patch<Payment>(`/api/admin/payments/${id}/status/`, data);
  },
};

export const gatewayConfigsAdmin = {
  list() {
    return httpClient.get<GatewayConfig[]>("/api/admin/gateway-configs/");
  },
  getById(id: string) {
    return httpClient.get<GatewayConfig>(`/api/admin/gateway-configs/${id}/`);
  },
  create(data: Partial<GatewayConfig>) {
    return httpClient.post<GatewayConfig>("/api/admin/gateway-configs/", data);
  },
  update(id: string, data: Partial<GatewayConfig>) {
    return httpClient.patch<GatewayConfig>(`/api/admin/gateway-configs/${id}/`, data);
  },
  remove(id: string) {
    return httpClient.delete(`/api/admin/gateway-configs/${id}/`);
  },
};
