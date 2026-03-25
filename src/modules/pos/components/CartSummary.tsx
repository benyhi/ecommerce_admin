"use client";

import { Button, Card, Divider, Group, Stack, Text, Title } from "@mantine/core";
import { IconCash, IconShoppingCart } from "@tabler/icons-react";

type Props = {
  itemCount: number;
  subtotal: number;
  total: number;
  canPay: boolean;
  onStartPayment: () => void;
};

export function CartSummary({ itemCount, subtotal, total, canPay, onStartPayment }: Props) {
  return (
    <Card withBorder>
      <Stack gap="sm">
        <Group justify="space-between">
          <Group gap="xs">
            <IconShoppingCart size={20} />
            <Title order={5}>Resumen</Title>
          </Group>
          <Text size="sm" c="dimmed">{itemCount} {itemCount === 1 ? "item" : "items"}</Text>
        </Group>

        <Divider />

        <Group justify="space-between">
          <Text size="sm">Subtotal</Text>
          <Text size="sm">${subtotal.toFixed(2)}</Text>
        </Group>

        <Group justify="space-between">
          <Text fw={700}>Total</Text>
          <Text fw={700} size="xl">${total.toFixed(2)}</Text>
        </Group>

        <Button
          size="lg"
          leftSection={<IconCash size={20} />}
          disabled={!canPay}
          onClick={onStartPayment}
          fullWidth
        >
          Cobrar
        </Button>
      </Stack>
    </Card>
  );
}
