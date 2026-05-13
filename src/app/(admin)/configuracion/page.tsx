"use client";

import { Tabs } from "@mantine/core";
import {
  IconBell,
  IconCoin,
  IconCreditCard,
  IconCrown,
  IconLock,
  IconPalette,
} from "@tabler/icons-react";

import { useAuth } from "@/context/AuthContext";
import { ResourcePage } from "@/modules/resources/ResourcePage";
import PlanContent from "@/modules/planes/PlanContent";
import NotificacionesConfigContent from "@/modules/notificaciones/NotificacionesConfigContent";
import GatewayConfigContent from "@/modules/pagos/GatewayConfigContent";
import MonedaIdiomaContent from "@/modules/configuracion/MonedaIdiomaContent";

export default function ConfiguracionPage() {
  const { hasFeature } = useAuth();
  const hasMultiCurrency = hasFeature("multi_currency");

  return (
    <Tabs defaultValue="configuracion" keepMounted={false}>
      <Tabs.List mb="lg">
        <Tabs.Tab value="configuracion" leftSection={<IconPalette size={16} />}>
          Configuración
        </Tabs.Tab>
        <Tabs.Tab value="notificaciones" leftSection={<IconBell size={16} />}>
          Notificaciones
        </Tabs.Tab>
        <Tabs.Tab value="pagos" leftSection={<IconCreditCard size={16} />}>
          Pasarelas de pago
        </Tabs.Tab>
        <Tabs.Tab
          value="moneda"
          leftSection={<IconCoin size={16} />}
          rightSection={
            !hasMultiCurrency ? (
              <IconLock size={13} style={{ opacity: 0.45 }} />
            ) : undefined
          }
        >
          Moneda e idioma
        </Tabs.Tab>
        <Tabs.Tab value="plan" leftSection={<IconCrown size={16} />}>
          Plan
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="configuracion">
        <ResourcePage resource="configuracion" />
      </Tabs.Panel>

      <Tabs.Panel value="notificaciones">
        <NotificacionesConfigContent />
      </Tabs.Panel>

      <Tabs.Panel value="pagos">
        <GatewayConfigContent />
      </Tabs.Panel>

      <Tabs.Panel value="moneda">
        <MonedaIdiomaContent />
      </Tabs.Panel>

      <Tabs.Panel value="plan">
        <PlanContent />
      </Tabs.Panel>
    </Tabs>
  );
}
