import { httpClient } from "../httpClient";
import { tokenManager } from "../tokenManager";
import type { LoginRequest, LoginResponse, UserInfo } from "../types";

export const authService = {
  /** Authenticate and store JWT tokens. Returns user info. */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await httpClient.post<LoginResponse>(
      "/api/auth/login/",
      data,
      { noAuth: true },
    );

    tokenManager.setTokens(response.access, response.refresh);
    tokenManager.setTenant(data.tenant);

    return response;
  },

  /** Refresh the access token using the stored refresh token. */
  async refresh(): Promise<string | null> {
    const refresh = tokenManager.getRefreshToken();
    if (!refresh) return null;

    const response = await httpClient.post<{ access: string }>(
      "/api/auth/refresh/",
      { refresh },
      { noAuth: true },
    );

    tokenManager.setAccessToken(response.access);
    return response.access;
  },

  /** Get the authenticated user's info. */
  async me(): Promise<UserInfo> {
    return httpClient.get<UserInfo>("/api/auth/me/");
  },

  /** Clear all stored auth data. */
  logout(): void {
    tokenManager.clearTokens();
    tokenManager.clearTenant();
  },
};
