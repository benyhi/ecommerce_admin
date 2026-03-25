"use client";

import {
  Button,
  Group,
  Image,
  Loader,
  SegmentedControl,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconQrcode } from "@tabler/icons-react";
import { useEffect } from "react";

import type { TransferMode } from "../types";

type Props = {
  total: number;
  transferMode: TransferMode;
  onTransferModeChange: (m: TransferMode) => void;
  qrData: string | null;
  aliasData: string | null;
  onGenerateQR: () => void;
  onGenerateAlias: () => void;
  onConfirm: () => void;
  onBack: () => void;
};

export function TransferPayment({
  total,
  transferMode,
  onTransferModeChange,
  qrData,
  aliasData,
  onGenerateQR,
  onGenerateAlias,
  onConfirm,
  onBack,
}: Props) {
  useEffect(() => {
    if (transferMode === "qr" && !qrData) onGenerateQR();
    if (transferMode === "alias" && !aliasData) onGenerateAlias();
    // only run when mode changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transferMode]);

  return (
    <Stack gap="md">
      <Title order={5}>Pago por transferencia</Title>

      <Group justify="space-between">
        <Text>Total a cobrar</Text>
        <Text fw={700} size="xl">${total.toFixed(2)}</Text>
      </Group>

      <SegmentedControl
        value={transferMode}
        onChange={(v) => onTransferModeChange(v as TransferMode)}
        data={[
          { label: "Código QR", value: "qr" },
          { label: "Alias", value: "alias" },
        ]}
        fullWidth
      />

      {transferMode === "qr" && (
        <Stack align="center" py="md">
          {qrData ? (
            <Image src={qrData} alt="QR de pago" w={220} h={220} fit="contain" />
          ) : (
            <Loader />
          )}
          <Text size="sm" c="dimmed">
            Escaneá el código QR con la app del banco o billetera
          </Text>
        </Stack>
      )}

      {transferMode === "alias" && (
        <Stack align="center" py="md">
          {aliasData ? (
            <>
              <IconQrcode size={40} opacity={0.3} />
              <Text size="lg" fw={700} ff="monospace">
                {aliasData}
              </Text>
              <Text size="sm" c="dimmed">
                Transferí a este alias desde tu banco
              </Text>
            </>
          ) : (
            <Loader />
          )}
        </Stack>
      )}

      <Group justify="flex-end" mt="sm">
        <Button variant="default" onClick={onBack}>Volver</Button>
        <Button onClick={onConfirm} size="lg">
          Confirmar recepción
        </Button>
      </Group>
    </Stack>
  );
}
