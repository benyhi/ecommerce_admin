"use client";

import { useDebouncedValue } from "@mantine/hooks";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ResourceName } from "@/context/AuthContext";
import { getAdminService } from "@/lib/api/services/admin.service";
import type { AdminResourceName } from "@/lib/api/services/admin.service";
import type { QueryParams } from "@/lib/api/types";

type CrudOptions = {
  pageSize?: number;
  defaultFilters?: Record<string, string | null>;
};

type CrudState<T> = {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  search: string;
  filters: Record<string, string | null>;
};

export function useCrudResource<T extends Record<string, unknown>>(
  resource: ResourceName,
  options: CrudOptions = {}
) {
  const [state, setState] = useState<CrudState<T>>({
    rows: [],
    total: 0,
    page: 1,
    pageSize: options.pageSize ?? 10,
    loading: false,
    error: null,
    search: "",
    filters: options.defaultFilters ?? { status: null },
  });

  const [debouncedSearch] = useDebouncedValue(state.search, 300);

  const service = useMemo(
    () => getAdminService(resource as AdminResourceName),
    [resource],
  );

  const queryParams: QueryParams = useMemo(() => {
    const params: QueryParams = {
      page: state.page,
    };
    if (debouncedSearch) params.search = debouncedSearch;
    if (state.filters) {
      for (const [key, value] of Object.entries(state.filters)) {
        if (value) params[key] = value;
      }
    }
    return params;
  }, [debouncedSearch, state.page, state.filters]);

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await service.list(queryParams);

      // Handle both paginated { count, results } and raw array responses
      let rows: T[];
      let total: number;

      if (Array.isArray(result)) {
        rows = result as T[];
        total = result.length;
      } else if (result && typeof result === "object") {
        rows = (result.results ?? []) as T[];
        total = result.count ?? rows.length;
      } else {
        rows = [];
        total = 0;
      }

      setState((prev) => ({
        ...prev,
        rows,
        total,
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Error inesperado",
      }));
    }
  }, [service, queryParams, resource]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setSearch = useCallback((value: string) => {
    setState((prev) => ({ ...prev, search: value, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setState((prev) => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setState((prev) => ({ ...prev, pageSize, page: 1 }));
  }, []);

  const setFilter = useCallback((key: string, value: string | null) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, [key]: value },
      page: 1,
    }));
  }, []);

  const createItem = useCallback(
    async (payload: Partial<T>) => {
      const item = await service.create(payload as Partial<Record<string, unknown>>);
      await refresh();
      return item as T;
    },
    [service, refresh],
  );

  const updateItem = useCallback(
    async (id: string, payload: Partial<T>) => {
      const item = await service.update(id, payload as Partial<Record<string, unknown>>);
      await refresh();
      return item as T;
    },
    [service, refresh],
  );

  const deleteItem = useCallback(
    async (id: string) => {
      await service.remove(id);
      await refresh();
    },
    [service, refresh],
  );

  return {
    ...state,
    refresh,
    setSearch,
    setPage,
    setPageSize,
    setFilter,
    createItem,
    updateItem,
    deleteItem,
  };
}
