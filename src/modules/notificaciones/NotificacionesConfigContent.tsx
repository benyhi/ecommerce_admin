"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Button,
  Card,
  Divider,
  Group,
  NumberInput,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
  Loader,
  Center,
  Alert,
} from "@mantine/core";
import { IconBell, IconCheck, IconInfoCircle } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { notificationsService } from "@/lib/api/services/notifications.service";
import type { NotificationConfig } from "@/lib/api/types";

const DEFAULT_CONFIG: NotificationConfig = {
  notification_email: "",
  email_notifications_enabled: true,
  low_stock_threshold: 5,
  notify_new_order: true,
  notify_order_status: true,
  notify_payment: true,
  notify_low_stock: true,
  notify_shipment: true,
  notify_new_user: false,
};

export default function NotificacionesConfigContent() {
  const [config, setConfig] = useState<NotificationConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await notificationsService.getConfig();
      setConfig(data);
    } catch {
      notifications.show({
        color: "red",
        title: "Error",
        message: "No se pudo cargar la configuración",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await notificationsService.updateConfig(config);
      setConfig(updated);
      notifications.show({
        color: "green",
        icon: <IconCheck size={16} />,
        title: "Guardado",
        message: "Configuración actualizada correctamente",
      });
    } catch {
      notifications.show({
        color: "red",
        title: "Error",
        message: "No se pudo guardar la configuración",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggle = (key: keyof NotificationConfig) =>
    setConfig((prev) => ({ ...prev, [key]: !prev[key] }));

  if (loading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  return (
    <Stack gap="lg">
      <Group>
        <IconBell size={24} />
        <Title order={3}>Configuración de Notificaciones</Title>
      </Group>

      {/* Email */}
      <Card withBorder>
        <Title order={5} mb="md">
          Envío de Emails
        </Title>

        <Stack gap="md">
          <Switch
            label="Habilitar envío de emails"
            description="Cuando está activo se envía un email al address configurado cada vez que se genera una notificación."
            checked={config.email_notifications_enabled}
            onChange={() => toggle("email_notifications_enabled")}
          />

          <TextInput
            label="Email de destino"
            description="Si está vacío se usa el email de contacto del tenant configurado en branding."
            placeholder="admin@tienda.com"
            value={config.notification_email}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                notification_email: e.target.value,
              }))
            }
            disabled={!config.email_notifications_enabled}
          />
        </Stack>
      </Card>

      {/* Tipos de notificaciones */}
      <Card withBorder>
        <Title order={5} mb="md">
          Tipos de Notificaciones
        </Title>
        <Stack gap="xs">
          <Switch
            label="Nuevos pedidos"
            description="Notificar cuando se recibe un nuevo pedido."
            checked={config.notify_new_order}
            onChange={() => toggle("notify_new_order")}
          />
          <Divider />
          <Switch
            label="Cambios de estado de pedido"
            description="Confirmado, en proceso, enviado, entregado, cancelado."
            checked={config.notify_order_status}
            onChange={() => toggle("notify_order_status")}
          />
          <Divider />
          <Switch
            label="Pagos"
            description="Pago recibido o fallido."
            checked={config.notify_payment}
            onChange={() => toggle("notify_payment")}
          />
          <Divider />
          <Switch
            label="Actualizaciones de envío"
            description="Cambios en el estado del envío."
            checked={config.notify_shipment}
            onChange={() => toggle("notify_shipment")}
          />
          <Divider />
          <Switch
            label="Stock bajo"
            description={`Notificar cuando el stock de un producto cae por debajo del umbral configurado.`}
            checked={config.notify_low_stock}
            onChange={() => toggle("notify_low_stock")}
          />

          {config.notify_low_stock && (
            <NumberInput
              label="Umbral de stock bajo"
              description="Se notifica cuando el stock de un producto queda igual o por debajo de este valor."
              min={1}
              max={9999}
              value={config.low_stock_threshold}
              onChange={(v) =>
                setConfig((prev) => ({
                  ...prev,
                  low_stock_threshold: Number(v) || 5,
                }))
              }
              w={200}
            />
          )}

          <Divider />
          <Switch
            label="Nuevos usuarios"
            description="Notificar cuando se registra un nuevo usuario en el panel."
            checked={config.notify_new_user}
            onChange={() => toggle("notify_new_user")}
          />
        </Stack>
      </Card>

      <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
        Las notificaciones se guardan en el panel y, si el email está habilitado, se envían al address
        configurado. El envío de email usa el servidor SMTP configurado en las variables de entorno.
      </Alert>

      <Group justify="flex-end">
        <Button
          leftSection={<IconCheck size={16} />}
          loading={saving}
          onClick={handleSave}
        >
          Guardar configuración
        </Button>
      </Group>
    </Stack>
  );
}
