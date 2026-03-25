const ACCESS_KEY = "auth-access-token";
const REFRESH_KEY = "auth-refresh-token";
const TENANT_KEY = "auth-tenant-slug";

function isClient(): boolean {
  return typeof window !== "undefined";
}

export const tokenManager = {
  getAccessToken(): string | null {
    if (!isClient()) return null;
    return localStorage.getItem(ACCESS_KEY);
  },

  getRefreshToken(): string | null {
    if (!isClient()) return null;
    return localStorage.getItem(REFRESH_KEY);
  },

  setTokens(access: string, refresh: string): void {
    if (!isClient()) return;
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },

  setAccessToken(access: string): void {
    if (!isClient()) return;
    localStorage.setItem(ACCESS_KEY, access);
  },

  clearTokens(): void {
    if (!isClient()) return;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },

  getTenant(): string | null {
    if (!isClient()) return null;
    return localStorage.getItem(TENANT_KEY);
  },

  setTenant(slug: string): void {
    if (!isClient()) return;
    localStorage.setItem(TENANT_KEY, slug);
  },

  clearTenant(): void {
    if (!isClient()) return;
    localStorage.removeItem(TENANT_KEY);
  },

  /** Decode JWT payload and check if the token is expired. */
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const exp = payload.exp as number;
      // 30-second buffer to avoid edge-case expirations mid-request
      return Date.now() >= (exp - 30) * 1000;
    } catch {
      return true;
    }
  },
};
