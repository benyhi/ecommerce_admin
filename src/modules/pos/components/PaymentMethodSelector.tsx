"use client";

import { SegmentedControl, Stack, Text } from "@mantine/core";
import { IconBuildingBank, IconCash, IconCreditCard } from "@tabler/icons-react";

import type { PaymentMethod } from "../types";

type Props = {
  value: PaymentMethod;
  onChange: (v: PaymentMethod) => void;
};

const options = [
  { label: "Efectivo", value: "cash" as const, Icon: IconCash },
  { label: "Transferencia", value: "transfer" as const, Icon: IconBuildingBank },
  { label: "Tarjeta", value: "card" as const, Icon: IconCreditCard },
];

export function PaymentMethodSelector({ value, onChange }: Props) {
  return (
    <Stack gap="xs">
      <Text size="sm" fw={600}>Método de pago</Text>
      <SegmentedControl
        value={value}
        onChange={(v) => onChange(v as PaymentMethod)}
        data={options.map((o) => ({
          label: (
            <span style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
              <o.Icon size={16} />
              {o.label}
            </span>
          ),
          value: o.value,
        }))}
        fullWidth
      />
    </Stack>
  );
}
