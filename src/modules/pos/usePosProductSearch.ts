"use client";

import { useDebouncedValue } from "@mantine/hooks";
import { useCallback, useEffect, useState } from "react";

import { catalogService } from "@/lib/api/services/catalog.service";
import type { Product } from "@/lib/api/types";
import type { PosProduct } from "./types";

/**
 * Searches products via the catalog API.
 * Returns PosProduct[] mapped from the API response.
 */
export function usePosProductSearch() {
  const [query, setQuery] = useState("");
  const [debounced] = useDebouncedValue(query, 300);
  const [results, setResults] = useState<PosProduct[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!debounced.trim()) {
      setResults([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    catalogService
      .getProducts({ search: debounced })
      .then((res) => {
        if (cancelled) return;
        setResults(
          res.results
            .filter((p) => p.active)
            .map(mapToProduct),
        );
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debounced]);

  const clear = useCallback(() => {
    setQuery("");
    setResults([]);
  }, []);

  return { query, setQuery, results, loading, clear };
}

function mapToProduct(item: Product): PosProduct {
  return {
    id: item.id,
    name: item.name,
    sku: "",
    price: Number(item.price) || 0,
    stock: 0,
    variants: (item.option_groups ?? []).flatMap((group) =>
      group.options
        .filter((opt) => opt.active)
        .map((opt) => ({
          id: opt.id,
          name: `${group.name}: ${opt.name}`,
          priceModifier: Number(opt.price) || 0,
        })),
    ),
  };
}
