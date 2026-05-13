"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { authService } from "@/lib/api/services/auth.service";
import { tokenManager } from "@/lib/api/tokenManager";
import type { ApiError, LicenseInfo } from "@/lib/api/types";
import type { UserRole } from "@/lib/api/types";

// ── Public types ────────────────────────────────────────

export type Role = UserRole; // "admin" | "employee" | "editor" | "read"
export type PermissionAction = "read" | "create" | "update" | "delete";

export type ResourceName =
  | "metricas"
  | "categorias"
  | "subcategorias"
  | "productos"
  | "pedidos"
  | "usuarios"
  | "clientes"
  | "configuracion"
  | "pos"
  | "sitio-publicaciones"
  | "sitio-carrusel"
  | "sitio-destacados"
  | "sitio"
  | "cupones"
  | "envios";

type UserInfo = {
  id: string;
  email: string;
  role: Role;
  tenant: { id: string; slug: string; name: string };
  license: LicenseInfo | null;
};

type AuthState = {
  user: UserInfo | null;
  loading: boolean;
};

type AuthContextValue = {
  user: UserInfo | null;
  isAuthenticated: boolean;
  loading: boolean;
  can: (action: PermissionAction, resource: ResourceName) => boolean;
  hasFeature: (featureKey: string) => boolean;
  license: LicenseInfo | null;
  login: (email: string, password: string, tenant: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  // Rehydrate session on mount: if we have a stored token, fetch user info
  useEffect(() => {
    const token = tokenManager.getAccessToken();
    if (!token) {
      setState({ user: null, loading: false });
      return;
    }

    authService
      .me()
      .then((user) => {
        setState({ user, loading: false });
      })
      .catch(() => {
        tokenManager.clearTokens();
        setState({ user: null, loading: false });
      });
  }, []);

  const can = useCallback(
    (action: PermissionAction, _resource: ResourceName) => {
      const role = state.user?.role;
      if (!role) return false;
      if (role === "admin") return true;
      if (role === "employee") return action !== "delete";
      if (role === "editor") return action === "read" || action === "update";
      return action === "read"; // "read" role
    },
    [state.user?.role],
  );

  const hasFeature = useCallback(
    (featureKey: string): boolean => {
      const features = state.user?.license?.features;
      if (!features) return true;
      return features[featureKey]?.enabled !== false;
    },
    [state.user?.license],
  );

  const login = useCallback(
    async (email: string, password: string, tenant: string) => {
      const response = await authService.login({ email, password, tenant });
      setState({ user: response.user, loading: false });
    },
    [],
  );

  const logout = useCallback(() => {
    authService.logout();
    setState({ user: null, loading: false });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: state.user,
      isAuthenticated: Boolean(state.user),
      loading: state.loading,
      can,
      hasFeature,
      license: state.user?.license ?? null,
      login,
      logout,
    }),
    [state.user, state.loading, can, hasFeature, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
