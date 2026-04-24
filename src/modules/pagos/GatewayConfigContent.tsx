"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Badge, Button, Card, Group, Modal, Stack, Switch, Text,
  TextInput, Title, Loader, Center, SimpleGrid, Textarea, Collapse, Anchor,
} from "@mantine/core";
import { IconSettings, IconPlus, IconCheck } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { gatewayConfigsAdmin } from "@/lib/api/services/payments.service";
import type { GatewayConfig, PaymentGateway } from "@/lib/api/types";

type GatewayMeta = {
  label: string;
  description: string;
  configFields: { key: string; label: string; placeholder?: string; sensitive?: boolean }[];
};

const GATEWAY_META: Record<PaymentGateway, GatewayMeta> = {
  mercadopago: {
    label: "MercadoPago",
    description: "Checkout Pro — tarjetas, MP Crédito, efectivo.",
    configFields: [
      { key: "access_token", label: "Access Token", placeholder: "APP_USR-...", sensitive: true },
      { key: "public_key", label: "Public Key (frontend)", placeholder: "APP_USR-...", sensitive: true },
    ],
  },
  naranja_x: {
    label: "Naranja X",
    description: "Tarjeta Naranja y billetera digital.",
    configFields: [
      { key: "merchant_id", label: "Merchant ID", sensitive: true },
      { key: "api_key", label: "API Key", sensitive: true },
      { key: "environment", label: "Entorno", placeholder: "sandbox | production" },
    ],
  },
  card: {
    label: "Tarjeta de crédito",
    description: "Visa, Mastercard, Amex — en cuotas.",
    configFields: [
      { key: "posnet_id", label: "ID de Posnet" },
      { key: "merchant_id", label: "Merchant ID (opcional)" },
    ],
  },
  debit: {
    label: "Tarjeta de débito",
    description: "Pago inmediato con débito.",
    configFields: [
      { key: "posnet_id", label: "ID de Posnet" },
    ],
  },
  transfer: {
    label: "Transferencia bancaria",
    description: "Pago manual — el cliente transfiere a tu CBU/alias.",
    configFields: [
      { key: "cbu", label: "CBU", placeholder: "22 dígitos" },
      { key: "alias", label: "Alias", placeholder: "TIENDA.ALIAS.MP" },
      { key: "bank_name", label: "Banco", placeholder: "Banco Nación" },
      { key: "account_holder", label: "Titular de la cuenta" },
    ],
  },
};

const ALL_GATEWAYS: PaymentGateway[] = ["mercadopago", "naranja_x", "card", "debit", "transfer"];

export default function GatewayConfigContent() {
  const [configs, setConfigs] = useState<GatewayConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editConfig, setEditConfig] = useState<GatewayConfig | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [formEnabled, setFormEnabled] = useState(false);

  const fetchConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await gatewayConfigsAdmin.list();
      setConfigs(res);
    } catch {
      notifications.show({ color: "red", message: "Error al cargar configuraciones" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConfigs(); }, [fetchConfigs]);

  function openEdit(gateway: PaymentGateway) {
    const existing = configs.find((c) => c.gateway === gateway);
    setEditConfig(existing ?? { id: "", gateway, gateway_display: GATEWAY_META[gateway].label, is_enabled: false, config: {}, updated_at: "" });
    setFormValues(existing?.config ?? {});
    setFormEnabled(existing?.is_enabled ?? false);
    setModalOpen(true);
  }

  async function handleSave() {
    if (!editConfig) return;
    setSaving(true);
    try {
      if (editConfig.id) {
        await gatewayConfigsAdmin.update(editConfig.id, { is_enabled: formEnabled, config: formValues });
      } else {
        await gatewayConfigsAdmin.create({ gateway: editConfig.gateway, is_enabled: formEnabled, config: formValues });
      }
      await fetchConfigs();
      setModalOpen(false);
      notifications.show({ color: "green", message: "Configuración guardada" });
    } catch {
      notifications.show({ color: "red", message: "Error al guardar configuración" });
    } finally {
      setSaving(false);
    }
  }

  async function toggleEnabled(configId: string, newValue: boolean) {
    try {
      await gatewayConfigsAdmin.update(configId, { is_enabled: newValue });
      await fetchConfigs();
      notifications.show({ color: "green", message: newValue ? "Pasarela habilitada" : "Pasarela deshabilitada" });
    } catch {
      notifications.show({ color: "red", message: "Error al actualizar" });
    }
  }

  if (loading) return <Center py="xl"><Loader /></Center>;

  const configsByGateway = Object.fromEntries(configs.map((c) => [c.gateway, c]));

  return (
    <Stack gap="md" p="md">
      <Title order={3}>Configuración de pasarelas de pago</Title>
      <Text c="dimmed" size="sm">
        Habilitá las pasarelas que acepta tu negocio y configurá las credenciales de cada una.
      </Text>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        {ALL_GATEWAYS.map((gw) => {
          const meta = GATEWAY_META[gw];
          const existing = configsByGateway[gw];
          const enabled = existing?.is_enabled ?? false;

          return (
            <Card key={gw} withBorder radius="md" padding="lg">
              <Group justify="space-between" mb="xs" align="flex-start">
                <div>
                  <Text fw={700}>{meta.label}</Text>
                  <Text size="sm" c="dimmed">{meta.description}</Text>
                </div>
                {existing ? (
                  <Switch
                    checked={enabled}
                    onChange={(e) => toggleEnabled(existing.id, e.currentTarget.checked)}
                    label={enabled ? "Activa" : "Inactiva"}
                    color="green"
                  />
                ) : (
                  <Badge color="gray" variant="outline">No configurada</Badge>
                )}
              </Group>

              {existing && enabled && (
                <Badge color="green" variant="light" leftSection={<IconCheck size={12} />} mb="sm">
                  Habilitada
                </Badge>
              )}

              <Button
                leftSection={existing ? <IconSettings size={16} /> : <IconPlus size={16} />}
                variant="light"
                size="xs"
                fullWidth
                onClick={() => openEdit(gw)}
              >
                {existing ? "Editar configuración" : "Configurar"}
              </Button>
            </Card>
          );
        })}
      </SimpleGrid>

      {/* Edit modal */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={<Text fw={700}>{editConfig ? GATEWAY_META[editConfig.gateway as PaymentGateway]?.label : ""}</Text>}
        size="md"
      >
        {editConfig && (
          <Stack gap="md">
            <Switch
              label="Habilitar esta pasarela"
              description="Los clientes podrán elegir este método de pago"
              checked={formEnabled}
              onChange={(e) => setFormEnabled(e.currentTarget.checked)}
              color="green"
            />

            {GATEWAY_META[editConfig.gateway as PaymentGateway]?.configFields.map((field) => (
              <TextInput
                key={field.key}
                label={field.label}
                placeholder={field.placeholder}
                value={formValues[field.key] ?? ""}
                onChange={(e) => { const v = e.currentTarget.value; setFormValues((prev) => ({ ...prev, [field.key]: v })); }}
                type={field.sensitive ? "password" : "text"}
                description={field.sensitive ? "Campo sensible — se guarda cifrado" : undefined}
              />
            ))}

            <Button loading={saving} onClick={handleSave} color="indigo" fullWidth>
              Guardar configuración
            </Button>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}
