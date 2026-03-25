"use client";

import { Button, Group, Loader, Stack, Text, Title } from "@mantine/core";
import { IconCreditCard } from "@tabler/icons-react";

type Props = {
  total: number;
  waiting: boolean;
  onStart: () => void;
  onCancel: () => void;
  onSkip: () => void;
  onBack: () => void;
};

export function CardPayment({ total, waiting, onStart, onCancel, onSkip, onBack }: Props) {
  return (
    <Stack gap="md">
      <Title order={5}>Pago con tarjeta</Title>

      <Group justify="space-between">
        <Text>Total a cobrar</Text>
        <Text fw={700} size="xl">${total.toFixed(2)}</Text>
      </Group>

      {waiting ? (
        <Stack align="center" py="xl">
          <Loader size="lg" />
          <Text>Esperando autorización del posnet…</Text>
          <Button variant="light" color="red" onClick={onCancel}>
            Cancelar
          </Button>
        </Stack>
      ) : (
        <Stack align="center" py="md">
          <IconCreditCard size={48} opacity={0.3} />
          <Text size="sm" c="dimmed">
            Conectá el posnet y presioná iniciar
          </Text>
        </Stack>
      )}

      <Group justify="flex-end" mt="sm">
        <Button variant="default" onClick={onBack}>Volver</Button>
        {!waiting && (
          <>
            <Button variant="light" onClick={onSkip}>
              Omitir posnet
            </Button>
            <Button leftSection={<IconCreditCard size={18} />} onClick={onStart} size="lg">
              Iniciar cobro
            </Button>
          </>
        )}
      </Group>
    </Stack>
  );
}
