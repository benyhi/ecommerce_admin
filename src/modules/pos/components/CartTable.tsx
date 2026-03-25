"use client";

import {
  ActionIcon,
  Group,
  NumberInput,
  Table,
  Text,
} from "@mantine/core";
import { IconMinus, IconPlus, IconTrash } from "@tabler/icons-react";

import type { PosCartItem } from "../types";

type Props = {
  items: PosCartItem[];
  onUpdateQty: (index: number, qty: number) => void;
  onRemove: (index: number) => void;
  readonly?: boolean;
};

export function CartTable({ items, onUpdateQty, onRemove, readonly }: Props) {
  if (items.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        No hay productos en el carrito
      </Text>
    );
  }

  return (
    <Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Producto</Table.Th>
          <Table.Th w={140} ta="center">Cant.</Table.Th>
          <Table.Th w={100} ta="right">Precio</Table.Th>
          <Table.Th w={100} ta="right">Subtotal</Table.Th>
          {!readonly && <Table.Th w={50} />}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {items.map((item, idx) => (
          <Table.Tr key={`${item.product.id}-${item.variant?.id ?? "base"}`}>
            <Table.Td>
              <Text size="sm" fw={500}>{item.product.name}</Text>
              {item.variant && (
                <Text size="xs" c="dimmed">{item.variant.name}</Text>
              )}
            </Table.Td>
            <Table.Td>
              {readonly ? (
                <Text ta="center">{item.quantity}</Text>
              ) : (
                <Group gap={4} justify="center" wrap="nowrap">
                  <ActionIcon
                    size="sm"
                    variant="light"
                    onClick={() => onUpdateQty(idx, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <IconMinus size={14} />
                  </ActionIcon>
                  <NumberInput
                    value={item.quantity}
                    onChange={(v) => onUpdateQty(idx, Number(v) || 1)}
                    min={1}
                    hideControls
                    size="xs"
                    w={50}
                    styles={{ input: { textAlign: "center" } }}
                  />
                  <ActionIcon
                    size="sm"
                    variant="light"
                    onClick={() => onUpdateQty(idx, item.quantity + 1)}
                  >
                    <IconPlus size={14} />
                  </ActionIcon>
                </Group>
              )}
            </Table.Td>
            <Table.Td ta="right">
              <Text size="sm">${item.unitPrice.toFixed(2)}</Text>
            </Table.Td>
            <Table.Td ta="right">
              <Text size="sm" fw={600}>${item.lineTotal.toFixed(2)}</Text>
            </Table.Td>
            {!readonly && (
              <Table.Td>
                <ActionIcon
                  color="red"
                  variant="subtle"
                  onClick={() => onRemove(idx)}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Table.Td>
            )}
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
