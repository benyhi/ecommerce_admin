"use client";

import { Autocomplete, Loader, Text } from "@mantine/core";
import { IconBarcode, IconSearch } from "@tabler/icons-react";
import { useState } from "react";

import type { PosProduct, ProductVariant } from "../types";
import { usePosProductSearch } from "../usePosProductSearch";
import { VariantSelector } from "./VariantSelector";

type Props = {
  onAdd: (product: PosProduct, variant: ProductVariant | null) => void;
};

export function ProductSearch({ onAdd }: Props) {
  const { query, setQuery, results, loading, clear } = usePosProductSearch();
  const [pendingProduct, setPendingProduct] = useState<PosProduct | null>(null);

  function handleSelect(value: string) {
    const product = results.find(
      (p) => p.name === value || p.barcode === value || p.sku === value,
    );
    if (!product) return;

    if (product.variants.length > 0) {
      setPendingProduct(product);
    } else {
      onAdd(product, null);
      clear();
    }
  }

  function handleVariantConfirm(variant: ProductVariant) {
    if (pendingProduct) {
      onAdd(pendingProduct, variant);
      setPendingProduct(null);
      clear();
    }
  }

  const options = results.map((p) => ({
    value: p.name,
    label: p.name,
  }));

  return (
    <>
      <Autocomplete
        placeholder="Buscar por nombre, SKU o código de barras…"
        leftSection={<IconSearch size={18} />}
        rightSection={
          loading ? (
            <Loader size={16} />
          ) : query ? (
            <IconBarcode size={18} />
          ) : null
        }
        value={query}
        onChange={setQuery}
        onOptionSubmit={handleSelect}
        data={options}
        size="lg"
      />

      {query && !loading && results.length === 0 && (
        <Text size="sm" c="dimmed" mt="xs">
          Sin resultados para &quot;{query}&quot;
        </Text>
      )}

      <VariantSelector
        product={pendingProduct}
        onConfirm={handleVariantConfirm}
        onClose={() => setPendingProduct(null)}
      />
    </>
  );
}
