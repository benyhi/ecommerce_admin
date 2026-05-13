import { httpClient } from "../httpClient";
import type { LicenseInfo } from "../types";

export type PlanFeatureDetail = {
  feature_key: string;
  is_enabled: boolean;
  limit_value: number | null;
};

export type PlanDetail = {
  id: number;
  name: string;
  slug: string;
  max_products: number;
  max_orders_month: number;
  price_usd: string;
  is_active: boolean;
  features: PlanFeatureDetail[];
};

export type LicenseDetail = {
  id: number;
  tenant_name: string;
  plan: PlanDetail;
  status: "active" | "expired" | "suspended";
  valid_from: string;
  valid_to: string | null;
  is_active: boolean;
};

export type LicenseUpdatePayload = {
  plan?: number;
  status?: "active" | "expired" | "suspended";
  valid_from?: string;
  valid_to?: string | null;
};

export const plansService = {
  /** Lista todos los planes disponibles (público). */
  listPlans(): Promise<PlanDetail[]> {
    return httpClient.get<PlanDetail[]>("/api/plans/");
  },

  /** Licencia del tenant actual. */
  getLicense(): Promise<LicenseDetail> {
    return httpClient.get<LicenseDetail>("/api/admin/plans/license/");
  },

  /** Actualiza la licencia del tenant actual (solo admin). */
  updateLicense(payload: LicenseUpdatePayload): Promise<LicenseDetail> {
    return httpClient.patch<LicenseDetail>("/api/admin/plans/license/", payload);
  },
};
