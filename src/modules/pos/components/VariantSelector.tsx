"use client";

import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import { useState } from "react";

import type { PosProduct, ProductVariant } from "../types";

type Props = {
  product: PosProduct | null;
  onConfirm: (variant: ProductVariant) => void;
  onClose: () => void;
};

export function VariantSelector({ product, onConfirm, onClose }: Props) {
  const [selected, setSelected] = useState<ProductVariant | null>(null);

  if (!product) return null;

  return (
    <Modal
      opened={!!product}
      onClose={onClose}
      title={`Variantes — ${product.name}`}
      centered
    >
      <Stack>
        {product.variants.map((v) => {
          const isSelected = selected?.id === v.id;
          return (
            <Button
              key={v.id}
              variant={isSelected ? "filled" : "light"}
              onClick={() => setSelected(v)}
              justify="space-between"
              fullWidth
            >
              <Text>{v.name}</Text>
              {v.priceModifier !== 0 && (
                <Text size="sm">
                  {v.priceModifier > 0 ? "+" : ""}${v.priceModifier.toFixed(2)}
                </Text>
              )}
            </Button>
          );
        })}

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            disabled={!selected}
            onClick={() => selected && onConfirm(selected)}
          >
            Agregar
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
