"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Center,
  Divider,
  Group,
  Loader,
  Modal,
  Progress,
  Select,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconCheck,
  IconCrown,
  IconLock,
  IconRefresh,
  IconRocket,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { plansService, type LicenseDetail, type PlanDetail } from "@/lib/api/services/plans.service";

// ── Feature labels ───────────────────────────────────────────────────────────

const FEATURE_LABELS: Record<string, string> = {
  coupons: "Cupones de descuento",
  notifications: "Notificaciones y alertas",
  digital_products: "Productos digitales",
  multi_currency: "Múltiples monedas",
  mercadopago: "MercadoPago",
  custom_domain: "Dominio personalizado",
  analytics: "Analíticas avanzadas",
};

const PLAN_ICONS: Record<string, React.ReactNode> = {
  starter: <IconRocket size={22} />,
  business: <IconCrown size={22} />,
  enterprise: <IconCrown size={22} />,
};

const PLAN_COLORS: Record<string, string> = {
  starter: "blue",
  business: "violet",
  enterprise: "orange",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: "Activa", color: "green" },
  expired: { label: "Vencida", color: "red" },
  suspended: { label: "Suspendida", color: "orange" },
};

// ── Sub-components ───────────────────────────────────────────────────────────

function FeatureRow({ featureKey, enabled, limit }: { featureKey: string; enabled: boolean; limit: number | null }) {
  const label = FEATURE_LABELS[featureKey] ?? featureKey;
  return (
    <Group justify="space-between" py={6}>
      <Group gap="xs">
        <ThemeIcon
          size="sm"
          radius="xl"
          color={enabled ? "green" : "gray"}
          variant="light"
        >
          {enabled ? <IconCheck size={12} /> : <IconLock size={12} />}
        </ThemeIcon>
        <Text size="sm" c={enabled ? undefined : "dimmed"}>
          {label}
        </Text>
      </Group>
      {limit !== null && limit !== undefined && (
        <Badge size="xs" variant="light" color="blue">
          Límite: {limit === 0 ? "Ilimitado" : limit}
        </Badge>
      )}
    </Group>
  );
}

function PlanCard({ plan, selected, onClick }: { plan: PlanDetail; selected: boolean; onClick: () => void }) {
  const color = PLAN_COLORS[plan.slug] ?? "blue";
  return (
    <Card
      withBorder
      radius="md"
      style={{
        cursor: "pointer",
        borderColor: selected ? `var(--mantine-color-${color}-6)` : undefined,
        borderWidth: selected ? 2 : 1,
      }}
      onClick={onClick}
    >
      <Stack gap="xs">
        <Group justify="space-between">
          <Group gap="xs">
            <ThemeIcon color={color} variant="light" size="md">
              {PLAN_ICONS[plan.slug] ?? <IconCrown size={16} />}
            </ThemeIcon>
            <Text fw={600}>{plan.name}</Text>
          </Group>
          {selected && <Badge color={color}>Actual</Badge>}
        </Group>
        <Text size="xl" fw={700}>
          {Number(plan.price_usd) === 0 ? "Gratis" : `$${plan.price_usd} USD/mes`}
        </Text>
        <Text size="xs" c="dimmed">
          {plan.max_products === 0 ? "Productos ilimitados" : `Hasta ${plan.max_products} productos`}
          {" · "}
          {plan.max_orders_month === 0 ? "Pedidos ilimitados" : `${plan.max_orders_month} pedidos/mes`}
        </Text>
        <Divider />
        <Stack gap={2}>
          {plan.features.map((f) => (
            <Group key={f.feature_key} gap="xs">
              <ThemeIcon size="xs" radius="xl" color={f.is_enabled ? "green" : "gray"} variant="light">
                {f.is_enabled ? <IconCheck size={10} /> : <IconLock size={10} />}
              </ThemeIcon>
              <Text size="xs" c={f.is_enabled ? undefined : "dimmed"}>
                {FEATURE_LABELS[f.feature_key] ?? f.feature_key}
              </Text>
            </Group>
          ))}
        </Stack>
      </Stack>
    </Card>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function PlanContent() {
  const [license, setLicense] = useState<LicenseDetail | null>(null);
  const [allPlans, setAllPlans] = useState<PlanDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [lic, plans] = await Promise.all([
        plansService.getLicense(),
        plansService.listPlans(),
      ]);
      setLicense(lic);
      setAllPlans(plans);
    } catch {
      notifications.show({ color: "red", title: "Error", message: "No se pudo cargar la información del plan." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleChangePlan = async () => {
    if (!selectedPlanId) return;
    setSaving(true);
    try {
      const updated = await plansService.updateLicense({ plan: Number(selectedPlanId) });
      setLicense(updated);
      setModalOpen(false);
      notifications.show({ color: "green", title: "Plan actualizado", message: `Ahora estás en el plan ${updated.plan.name}.` });
    } catch {
      notifications.show({ color: "red", title: "Error", message: "No se pudo cambiar el plan." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Center py="xl"><Loader /></Center>;
  }

  if (!license) {
    return (
      <Alert color="orange" icon={<IconAlertCircle size={16} />} title="Sin licencia">
        Este tenant no tiene una licencia asignada. Contactá al administrador de la plataforma.
      </Alert>
    );
  }

  const statusInfo = STATUS_LABELS[license.status] ?? { label: license.status, color: "gray" };
  const planColor = PLAN_COLORS[license.plan.slug] ?? "blue";

  return (
    <Stack gap="lg">
      {/* Header */}
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={3}>Plan actual</Title>
          <Text c="dimmed" size="sm">Gestioná tu suscripción y los features habilitados.</Text>
        </div>
        <Button
          leftSection={<IconRefresh size={16} />}
          variant="light"
          onClick={() => { setSelectedPlanId(String(license.plan.id)); setModalOpen(true); }}
        >
          Cambiar plan
        </Button>
      </Group>

      {/* License status card */}
      <Card withBorder radius="md" p="lg">
        <Group justify="space-between" mb="md">
          <Group gap="sm">
            <ThemeIcon color={planColor} size="lg" variant="light" radius="md">
              {PLAN_ICONS[license.plan.slug] ?? <IconCrown size={20} />}
            </ThemeIcon>
            <div>
              <Text fw={700} size="lg">{license.plan.name}</Text>
              <Text size="xs" c="dimmed">
                {Number(license.plan.max_products) === 0 ? "Productos ilimitados" : `Hasta ${license.plan.max_products} productos`}
                {" · "}
                {Number(license.plan.max_orders_month) === 0 ? "Pedidos ilimitados" : `${license.plan.max_orders_month} pedidos/mes`}
              </Text>
            </div>
          </Group>
          <Stack gap={4} align="flex-end">
            <Badge color={statusInfo.color} size="md">{statusInfo.label}</Badge>
            {license.valid_to && (
              <Text size="xs" c="dimmed">
                Vence: {new Date(license.valid_to).toLocaleDateString("es-AR")}
              </Text>
            )}
            {!license.valid_to && (
              <Text size="xs" c="dimmed">Sin vencimiento</Text>
            )}
          </Stack>
        </Group>

        {!license.is_active && (
          <Alert color="red" icon={<IconAlertCircle size={16} />} mb="md">
            Tu licencia no está activa. Algunas funcionalidades pueden estar bloqueadas.
          </Alert>
        )}

        <Divider mb="md" label="Features incluidos" labelPosition="left" />

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
          {license.plan.features.map((f) => (
            <FeatureRow
              key={f.feature_key}
              featureKey={f.feature_key}
              enabled={f.is_enabled}
              limit={f.limit_value}
            />
          ))}
        </SimpleGrid>
      </Card>

      {/* Usage summary */}
      {(license.plan.max_products > 0 || license.plan.max_orders_month > 0) && (
        <Card withBorder radius="md" p="lg">
          <Title order={5} mb="md">Límites del plan</Title>
          <Stack gap="sm">
            {license.plan.max_products > 0 && (
              <div>
                <Group justify="space-between" mb={4}>
                  <Text size="sm">Productos</Text>
                  <Text size="sm" c="dimmed">Límite: {license.plan.max_products}</Text>
                </Group>
                <Progress value={0} color={planColor} size="sm" radius="xl" />
              </div>
            )}
            {license.plan.max_orders_month > 0 && (
              <div>
                <Group justify="space-between" mb={4}>
                  <Text size="sm">Pedidos este mes</Text>
                  <Text size="sm" c="dimmed">Límite: {license.plan.max_orders_month}</Text>
                </Group>
                <Progress value={0} color={planColor} size="sm" radius="xl" />
              </div>
            )}
          </Stack>
        </Card>
      )}

      {/* Change plan modal */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Cambiar plan"
        size="xl"
        centered
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Seleccioná el plan que mejor se adapte a tu negocio. El cambio es inmediato.
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            {allPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                selected={String(plan.id) === selectedPlanId}
                onClick={() => setSelectedPlanId(String(plan.id))}
              />
            ))}
          </SimpleGrid>
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleChangePlan}
              loading={saving}
              disabled={!selectedPlanId || selectedPlanId === String(license.plan.id)}
            >
              Confirmar cambio
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
