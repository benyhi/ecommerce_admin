"use client";

import { Button, Card, Divider, Group, Stack, Table, Text, Title } from "@mantine/core";
import { IconCheck, IconPrinter } from "@tabler/icons-react";

import type { CompletedSale } from "../types";

type Props = {
  sale: CompletedSale;
  onNewSale: () => void;
};

const methodLabels: Record<string, string> = {
  cash: "Efectivo",
  transfer: "Transferencia",
  card: "Tarjeta",
};

export function TicketPreview({ sale, onNewSale }: Props) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Card withBorder p="lg">
      <Stack gap="md" align="center">
        <IconCheck size={48} color="var(--mantine-color-green-6)" />
        <Title order={3}>¡Venta completada!</Title>
        <Text c="dimmed">N° {sale.orderNumber}</Text>
      </Stack>

      <Divider my="md" />

      <Table>
        <Table.Tbody>
          {sale.items.map((item, idx) => (
            <Table.Tr key={idx}>
              <Table.Td>
                {item.product.name}
                {item.variant ? ` (${item.variant.name})` : ""}
              </Table.Td>
              <Table.Td ta="center">{item.quantity}</Table.Td>
              <Table.Td ta="right">${item.lineTotal.toFixed(2)}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Divider my="sm" />

      <Stack gap={4}>
        <Group justify="space-between">
          <Text fw={700}>Total</Text>
          <Text fw={700} size="lg">${sale.total.toFixed(2)}</Text>
        </Group>

        <Group justify="space-between">
          <Text size="sm">Método</Text>
          <Text size="sm">{methodLabels[sale.payment.method] ?? sale.payment.method}</Text>
        </Group>

        {sale.payment.change != null && sale.payment.change > 0 && (
          <Group justify="space-between">
            <Text size="sm">Vuelto</Text>
            <Text size="sm">${sale.payment.change.toFixed(2)}</Text>
          </Group>
        )}

        {sale.payment.reference && (
          <Group justify="space-between">
            <Text size="sm">Referencia</Text>
            <Text size="sm" ff="monospace">{sale.payment.reference}</Text>
          </Group>
        )}

        <Text size="xs" c="dimmed" ta="center" mt="sm">
          {new Date(sale.timestamp).toLocaleString("es-AR")}
        </Text>
      </Stack>

      <Group justify="center" mt="lg">
        <Button variant="light" leftSection={<IconPrinter size={18} />} onClick={handlePrint}>
          Imprimir ticket
        </Button>
        <Button onClick={onNewSale}>
          Nueva venta
        </Button>
      </Group>
    </Card>
  );
}
