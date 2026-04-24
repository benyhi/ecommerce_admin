"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Badge, Button, Group, Modal, Paper, ScrollArea, Select, Stack,
  Table, Text, TextInput, Title, Loader, Center, ActionIcon, Tooltip, Textarea,
} from "@mantine/core";
import { IconSearch, IconRefresh, IconEye, IconCheck, IconX } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { paymentsAdmin } from "@/lib/api/services/payments.service";
import type { Payment, PaymentStatus } from "@/lib/api/types";

const STATUS_COLOR: Record<PaymentStatus, string> = {
  pending: "yellow",
  in_process: "blue",
  approved: "green",
  rejected: "red",
  cancelled: "gray",
  refunded: "orange",
  charged_back: "red",
};

const STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pendiente",
  in_process: "En proceso",
  approved: "Aprobado",
  rejected: "Rechazado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
  charged_back: "Contracargo",
};

function formatARS(n: string | number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(Number(n));
}

function formatDate(d: string) {
  return new Date(d).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function PagosContent() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [gatewayFilter, setGatewayFilter] = useState<string | null>(null);

  const [detailPayment, setDetailPayment] = useState<Payment | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [updateStatus, setUpdateStatus] = useState("");
  const [updateNotes, setUpdateNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (gatewayFilter) params.gateway = gatewayFilter;
      const res = await paymentsAdmin.list(params);
      setPayments(res.results ?? []);
    } catch {
      notifications.show({ color: "red", message: "Error al cargar pagos" });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, gatewayFilter]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  async function openDetail(p: Payment) {
    try {
      const full = await paymentsAdmin.getById(p.id);
      setDetailPayment(full);
      setUpdateStatus(full.status);
      setUpdateNotes(full.notes ?? "");
      setDetailOpen(true);
    } catch {
      notifications.show({ color: "red", message: "Error al cargar detalle" });
    }
  }

  async function handleUpdateStatus() {
    if (!detailPayment) return;
    setUpdating(true);
    try {
      const updated = await paymentsAdmin.updateStatus(detailPayment.id, { status: updateStatus, notes: updateNotes });
      setDetailPayment(updated);
      await fetchPayments();
      notifications.show({ color: "green", message: "Estado actualizado correctamente" });
    } catch {
      notifications.show({ color: "red", message: "Error al actualizar estado" });
    } finally {
      setUpdating(false);
    }
  }

  const rows = payments.map((p) => (
    <Table.Tr key={p.id}>
      <Table.Td>
        <Text size="sm" fw={600}>{p.order_number ?? "—"}</Text>
        <Text size="xs" c="dimmed">{p.id.slice(0, 8)}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{p.payer_name || "—"}</Text>
        <Text size="xs" c="dimmed">{p.payer_email}</Text>
      </Table.Td>
      <Table.Td>
        <Badge variant="light" color="indigo">{p.gateway_display}</Badge>
      </Table.Td>
      <Table.Td>
        <Badge color={STATUS_COLOR[p.status as PaymentStatus] ?? "gray"}>
          {STATUS_LABELS[p.status as PaymentStatus] ?? p.status}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm" fw={700}>{formatARS(p.amount)}</Text>
        {p.installments > 1 && (
          <Text size="xs" c="dimmed">{p.installments} cuotas de {p.installment_amount ? formatARS(p.installment_amount) : "—"}</Text>
        )}
      </Table.Td>
      <Table.Td>
        <Text size="xs" c="dimmed">{formatDate(p.created_at)}</Text>
      </Table.Td>
      <Table.Td>
        <Tooltip label="Ver detalle">
          <ActionIcon variant="light" onClick={() => openDetail(p)}>
            <IconEye size={16} />
          </ActionIcon>
        </Tooltip>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack gap="md" p="md">
      <Group justify="space-between">
        <Title order={3}>Pagos</Title>
        <Button leftSection={<IconRefresh size={16} />} variant="light" onClick={fetchPayments}>
          Actualizar
        </Button>
      </Group>

      {/* Filters */}
      <Group gap="sm" wrap="wrap">
        <TextInput
          placeholder="Buscar por cliente, email, pedido..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        <Select
          placeholder="Estado"
          clearable
          value={statusFilter}
          onChange={setStatusFilter}
          data={Object.entries(STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }))}
          style={{ width: 180 }}
        />
        <Select
          placeholder="Pasarela"
          clearable
          value={gatewayFilter}
          onChange={setGatewayFilter}
          data={[
            { value: "mercadopago", label: "MercadoPago" },
            { value: "naranja_x", label: "Naranja X" },
            { value: "card", label: "Tarjeta crédito" },
            { value: "debit", label: "Tarjeta débito" },
            { value: "transfer", label: "Transferencia" },
          ]}
          style={{ width: 180 }}
        />
      </Group>

      {/* Table */}
      <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
        <ScrollArea>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Pedido / ID</Table.Th>
                <Table.Th>Cliente</Table.Th>
                <Table.Th>Pasarela</Table.Th>
                <Table.Th>Estado</Table.Th>
                <Table.Th>Monto</Table.Th>
                <Table.Th>Fecha</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {loading ? (
                <Table.Tr>
                  <Table.Td colSpan={7}>
                    <Center py="xl"><Loader size="sm" /></Center>
                  </Table.Td>
                </Table.Tr>
              ) : rows.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={7}>
                    <Center py="xl"><Text c="dimmed">Sin pagos registrados.</Text></Center>
                  </Table.Td>
                </Table.Tr>
              ) : rows}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>

      {/* Detail modal */}
      <Modal
        opened={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={<Text fw={700}>Detalle del pago</Text>}
        size="lg"
      >
        {detailPayment && (
          <Stack gap="md">
            <Group grow>
              <Paper withBorder p="sm" radius="md">
                <Text size="xs" c="dimmed">Pasarela</Text>
                <Text fw={600}>{detailPayment.gateway_display}</Text>
              </Paper>
              <Paper withBorder p="sm" radius="md">
                <Text size="xs" c="dimmed">Monto</Text>
                <Text fw={700} size="lg">{formatARS(detailPayment.amount)}</Text>
              </Paper>
              <Paper withBorder p="sm" radius="md">
                <Text size="xs" c="dimmed">Cuotas</Text>
                <Text fw={600}>{detailPayment.installments}x{detailPayment.installment_amount ? ` ${formatARS(detailPayment.installment_amount)}` : ""}</Text>
              </Paper>
            </Group>

            <Paper withBorder p="sm" radius="md">
              <Text size="xs" c="dimmed" mb={4}>Pagador</Text>
              <Text fw={600}>{detailPayment.payer_name || "—"}</Text>
              <Text size="sm" c="dimmed">{detailPayment.payer_email} {detailPayment.payer_phone ? `· ${detailPayment.payer_phone}` : ""}</Text>
            </Paper>

            {/* Attempts */}
            {(detailPayment.attempts?.length ?? 0) > 0 && (
              <div>
                <Text fw={600} mb="xs">Intentos de pago</Text>
                <Stack gap="xs">
                  {detailPayment.attempts?.map((a) => (
                    <Group key={a.id} justify="space-between" p="xs" style={{ border: "1px solid var(--mantine-color-default-border)", borderRadius: 8 }}>
                      <Group gap="xs">
                        {a.status === "success" ? <IconCheck size={16} color="green" /> : a.status === "failed" ? <IconX size={16} color="red" /> : null}
                        <Text size="sm">{a.status === "success" ? "Exitoso" : a.status === "failed" ? "Fallido" : "Pendiente"}</Text>
                        {a.error_message && <Text size="xs" c="red">{a.error_message}</Text>}
                      </Group>
                      <Text size="xs" c="dimmed">{formatDate(a.created_at)}</Text>
                    </Group>
                  ))}
                </Stack>
              </div>
            )}

            {/* Status update */}
            <Paper withBorder p="sm" radius="md">
              <Text fw={600} mb="sm">Actualizar estado</Text>
              <Stack gap="sm">
                <Select
                  label="Nuevo estado"
                  value={updateStatus}
                  onChange={(v) => setUpdateStatus(v ?? "")}
                  data={Object.entries(STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }))}
                />
                <Textarea
                  label="Notas internas"
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.currentTarget.value)}
                  placeholder="Motivo del cambio de estado..."
                  rows={2}
                />
                <Button loading={updating} onClick={handleUpdateStatus} color="indigo">
                  Guardar cambio
                </Button>
              </Stack>
            </Paper>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}
