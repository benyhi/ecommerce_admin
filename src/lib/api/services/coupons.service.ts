import { httpClient } from "../httpClient";
import type { Coupon, CouponWrite, CouponValidationResult, PaginatedResponse, QueryParams } from "../types";

export const couponsAdmin = {
  list(params?: QueryParams) {
    return httpClient.get<PaginatedResponse<Coupon>>("/api/admin/coupons/", params);
  },
  getById(id: string) {
    return httpClient.get<Coupon>(`/api/admin/coupons/${id}/`);
  },
  create(data: CouponWrite) {
    return httpClient.post<Coupon>("/api/admin/coupons/", data);
  },
  update(id: string, data: Partial<CouponWrite>) {
    return httpClient.patch<Coupon>(`/api/admin/coupons/${id}/`, data);
  },
  remove(id: string) {
    return httpClient.delete(`/api/admin/coupons/${id}/`);
  },
};

export const couponsPublic = {
  validate(code: string, amount: number) {
    return httpClient.get<CouponValidationResult>("/api/coupons/validate/", {
      code,
      amount,
    } as Record<string, string | number>);
  },
};
