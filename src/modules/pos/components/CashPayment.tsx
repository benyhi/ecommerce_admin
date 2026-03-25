"use client";

import { Button, Group, NumberInput, Stack, Text, Title } from "@mantine/core";
import { IconCash } from "@tabler/icons-react";
import { useState } from "react";

type Props = {
  total: number;
  onConfirm: (amountPaid: number) => void;
  onBack: () => void;
};

export function CashPayment({ total, onConfirm, onBack }: Props) {
  const [amountPaid, setAmountPaid] = useState<number>(total);
  const change = amountPaid - total;

  return (
    <Stack gap="md">
      <Title order={5}>Pago en efectivo</Title>

      <Group justify="space-between">
        <Text>Total a cobrar</Text>
        <Text fw={700} size="xl">${total.toFixed(2)}</Text>
      </Group>

      <NumberInput
        label="Monto recibido"
        leftSection={<IconCash size={18} />}
        value={amountPaid}
        onChange={(v) => setAmountPaid(Number(v) || 0)}
        min={0}
        decimalScale={2}
        size="lg"
      />

      <Group justify="space-between" p="sm" style={{ borderRadius: 8, background: change >= 0 ? "var(--mantine-color-green-light)" : "var(--mantine-color-red-light)" }}>
        <Text fw={600}>Vuelto</Text>
        <Text fw={700} size="xl">
          ${Math.max(change, 0).toFixed(2)}
        </Text>
      </Group>

      <Group justify="flex-end" mt="sm">
        <Button variant="default" onClick={onBack}>Volver</Button>
        <Button
          disabled={amountPaid < total}
          onClick={() => onConfirm(amountPaid)}
          size="lg"
        >
          Confirmar cobro
        </Button>
      </Group>
    </Stack>
  );
}
