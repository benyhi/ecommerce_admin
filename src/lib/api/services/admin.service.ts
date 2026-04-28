import { httpClient } from "../httpClient";
import type { PaginatedResponse, QueryParams } from "../types";

// ── Generic CRUD factory ────────────────────────────────

export type AdminService<T> = {
  list(params?: QueryParams): Promise<PaginatedResponse<T>>;
  getById(id: string): Promise<T>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  remove(id: string): Promise<void>;
};

/**
 * Creates a typed CRUD service for an admin resource.
 *
 * @param basePath  The API path prefix, e.g. "/api/admin/categories"
 */
export function createAdminService<T>(basePath: string): AdminService<T> {
  // Ensure no trailing slash for consistent path building
  const path = basePath.replace(/\/$/, "");

  return {
    list(params?: QueryParams) {
      return httpClient.get<PaginatedResponse<T>>(`${path}/`, params);
    },

    getById(id: string) {
      return httpClient.get<T>(`${path}/${id}/`);
    },

    create(data: Partial<T>) {
      return httpClient.post<T>(`${path}/`, data);
    },

    update(id: string, data: Partial<T>) {
      return httpClient.put<T>(`${path}/${id}/`, data);
    },

    remove(id: string) {
      return httpClient.delete(`${path}/${id}/`);
    },
  };
}

// ── Pre-built admin service instances ───────────────────

// Catalog (write endpoints require auth)
export const categoriesAdmin = createAdminService<Record<string, unknown>>(
  "/api/admin/catalog/categories",
);
export const productsAdmin = createAdminService<Record<string, unknown>>(
  "/api/admin/catalog/products",
);
export const optionGroupsAdmin = createAdminService<Record<string, unknown>>(
  "/api/admin/catalog/option-groups",
);
export const optionsAdmin = createAdminService<Record<string, unknown>>(
  "/api/admin/catalog/options",
);
export const attributesAdmin = createAdminService<Record<string, unknown>>(
  "/api/admin/catalog/attributes",
);
export const badgesAdmin = createAdminService<Record<string, unknown>>(
  "/api/admin/catalog/badges",
);

// Website / site configuration
export const postsAdmin = createAdminService<Record<string, unknown>>(
  "/api/admin/site/posts",
);
export const bannersAdmin = createAdminService<Record<string, unknown>>(
  "/api/admin/site/banners",
);
export const featuredAdmin = createAdminService<Record<string, unknown>>(
  "/api/admin/site/featured",
);

// Other admin resources
export const ordersAdmin = createAdminService<Record<string, unknown>>(
  "/api/admin/orders",
);
export const usersAdmin = createAdminService<Record<string, unknown>>(
  "/api/admin/users",
);
export const customersAdmin = createAdminService<Record<string, unknown>>(
  "/api/admin/customers",
);
export const configAdmin = createAdminService<Record<string, unknown>>(
  "/api/admin/config",
);
export const metricsAdmin = createAdminService<Record<string, unknown>>(
  "/api/admin/metrics",
);
export const couponsAdmin = createAdminService<Record<string, unknown>>(
  "/api/admin/coupons",
);

// ── Resource name → service mapping ─────────────────────

export type AdminResourceName =
  | "metricas"
  | "categorias"
  | "productos"
  | "pedidos"
  | "usuarios"
  | "clientes"
  | "configuracion"
  | "sitio-publicaciones"
  | "sitio-carrusel"
  | "cupones";

const adminServiceMap: Record<AdminResourceName, AdminService<Record<string, unknown>>> = {
  metricas: metricsAdmin,
  categorias: categoriesAdmin,
  productos: productsAdmin,
  pedidos: ordersAdmin,
  usuarios: usersAdmin,
  clientes: customersAdmin,
  configuracion: configAdmin,
  "sitio-publicaciones": postsAdmin,
  "sitio-carrusel": bannersAdmin,
  cupones: couponsAdmin,
};

/**
 * Get the admin CRUD service for a given resource name.
 * Use this from generic components like ResourcePage / useCrudResource.
 */
export function getAdminService(
  resource: AdminResourceName,
): AdminService<Record<string, unknown>> {
  return adminServiceMap[resource];
}
