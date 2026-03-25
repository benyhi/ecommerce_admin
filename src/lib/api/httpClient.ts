import { ApiError, RefreshResponse } from "./types";
import { tokenManager } from "./tokenManager";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

// ── Helpers ─────────────────────────────────────────────

function buildUrl(
  path: string,
  params?: Record<string, string | number | undefined>,
): string {
  const url = `${API_BASE_URL}${path}`;
  if (!params) return url;

  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      qs.set(key, String(value));
    }
  }
  const search = qs.toString();
  return search ? `${url}?${search}` : url;
}

async function parseErrorResponse(res: Response): Promise<ApiError> {
  let message = `Request failed with status ${res.status}`;
  let fieldErrors: Record<string, string[]> = {};

  try {
    const body = await res.json();
    if (typeof body === "object" && body !== null) {
      if (typeof body.detail === "string") {
        message = body.detail;
      } else if (typeof body.message === "string") {
        message = body.message;
      }

      // DRF validation errors: { field: ["error1", "error2"] }
      for (const [key, val] of Object.entries(body)) {
        if (key === "detail" || key === "message") continue;
        if (Array.isArray(val)) {
          fieldErrors[key] = val.map(String);
        }
      }
    }
  } catch {
    // response wasn't JSON — keep default message
  }

  return new ApiError(res.status, message, fieldErrors);
}

// ── Refresh lock (prevents concurrent refresh calls) ────

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = tokenManager.getRefreshToken();
  if (!refresh) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (!res.ok) {
      tokenManager.clearTokens();
      return null;
    }

    const data = (await res.json()) as RefreshResponse;
    tokenManager.setAccessToken(data.access);
    return data.access;
  } catch {
    tokenManager.clearTokens();
    return null;
  }
}

async function getValidAccessToken(): Promise<string | null> {
  const token = tokenManager.getAccessToken();
  if (!token) return null;

  if (!tokenManager.isTokenExpired(token)) return token;

  // Deduplicate concurrent refresh attempts
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

// ── Core request ────────────────────────────────────────

type RequestConfig = {
  method: string;
  path: string;
  params?: Record<string, string | number | undefined>;
  body?: unknown;
  /** Skip Authorization header (for public endpoints like login) */
  noAuth?: boolean;
};

async function request<T>(config: RequestConfig): Promise<T> {
  const url = buildUrl(config.path, config.params);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Auth header
  if (!config.noAuth) {
    const token = await getValidAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  // Tenant header
  const tenant = tokenManager.getTenant();
  if (tenant) headers["X-Tenant"] = tenant;

  let res = await fetch(url, {
    method: config.method,
    headers,
    body: config.body ? JSON.stringify(config.body) : undefined,
    cache: "no-store",
  });

  // 401 → try to refresh token and retry once
  if (res.status === 401 && !config.noAuth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.Authorization = `Bearer ${newToken}`;
      res = await fetch(url, {
        method: config.method,
        headers,
        body: config.body ? JSON.stringify(config.body) : undefined,
        cache: "no-store",
      });
    } else {
      // Refresh failed — redirect to sign in
      if (typeof window !== "undefined") {
        window.location.href = "/signin";
      }
      throw new ApiError(401, "Session expired. Please sign in again.");
    }
  }

  if (!res.ok) {
    throw await parseErrorResponse(res);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// ── Public API ──────────────────────────────────────────

export const httpClient = {
  get<T>(
    path: string,
    params?: Record<string, string | number | undefined>,
    options?: { noAuth?: boolean },
  ): Promise<T> {
    return request<T>({ method: "GET", path, params, ...options });
  },

  post<T>(path: string, body?: unknown, options?: { noAuth?: boolean }): Promise<T> {
    return request<T>({ method: "POST", path, body, ...options });
  },

  put<T>(path: string, body?: unknown): Promise<T> {
    return request<T>({ method: "PUT", path, body });
  },

  patch<T>(path: string, body?: unknown): Promise<T> {
    return request<T>({ method: "PATCH", path, body });
  },

  delete(path: string): Promise<void> {
    return request<void>({ method: "DELETE", path });
  },
};
