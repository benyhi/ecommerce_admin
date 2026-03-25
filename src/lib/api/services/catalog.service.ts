import { httpClient } from "../httpClient";
import type {
  Category,
  PaginatedResponse,
  Product,
  QueryParams,
} from "../types";

export const catalogService = {
  /** List active categories with their nested products. */
  getCategories(params?: QueryParams): Promise<PaginatedResponse<Category>> {
    return httpClient.get("/api/catalog/categories/", params, { noAuth: true });
  },

  /** Get a single category by ID. */
  getCategory(id: string): Promise<Category> {
    return httpClient.get(`/api/catalog/categories/${id}/`, undefined, {
      noAuth: true,
    });
  },

  /** List active products with category and option groups. */
  getProducts(params?: QueryParams): Promise<PaginatedResponse<Product>> {
    return httpClient.get("/api/catalog/products/", params, { noAuth: true });
  },

  /** Get a single product by ID. */
  getProduct(id: string): Promise<Product> {
    return httpClient.get(`/api/catalog/products/${id}/`, undefined, {
      noAuth: true,
    });
  },
};
