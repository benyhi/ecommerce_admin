"use client";

import { NavLink, ScrollArea, Stack, Text, Tooltip } from "@mantine/core";
import {
  IconBox,
  IconCalendar,
  IconCashRegister,
  IconCategory,
  IconChartPie,
  IconClipboardList,
  IconCloud,
  IconCreditCard,
  IconDiscount2,
  IconLock,
  IconSettings,
  IconTruck,
  IconUser,
  IconUsers,
  IconWorld,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { useAuth } from "@/context/AuthContext";

type NavItem = {
  icon: React.ElementType;
  label: string;
  href: string;
  featureKey?: string;
};

const navItems: NavItem[] = [
  { icon: IconChartPie, label: "Metricas", href: "/metricas", featureKey: "analytics" },
  { icon: IconCashRegister, label: "Punto de Venta", href: "/pos", featureKey: "pos" },
  { icon: IconCalendar, label: "Calendario", href: "/calendar", featureKey: "calendar" },
  { icon: IconUsers, label: "Clientes", href: "/clientes", featureKey: "customers" },
  { icon: IconCategory, label: "Categorias", href: "/categorias", featureKey: "catalog" },
  { icon: IconBox, label: "Productos", href: "/productos", featureKey: "catalog" },
  { icon: IconClipboardList, label: "Pedidos", href: "/pedidos", featureKey: "orders" },
  { icon: IconTruck, label: "Envios", href: "/envios", featureKey: "shipping" },
  { icon: IconCreditCard, label: "Pagos", href: "/pagos", featureKey: "payments" },
  { icon: IconDiscount2, label: "Cupones", href: "/cupones", featureKey: "coupons" },
  { icon: IconCloud, label: "Test Bucket", href: "/test-bucket", featureKey: "cloud" },
  { icon: IconWorld, label: "Sitio Web", href: "/sitio", featureKey: "site" },
  { icon: IconUser, label: "Usuarios", href: "/usuarios", featureKey: "users" },
  { icon: IconSettings, label: "Configuracion", href: "/configuracion", featureKey: "settings" },
];

const AppSidebar: React.FC = () => {
  const pathname = usePathname();
  const { hasFeature } = useAuth();

  return (
    <ScrollArea type="auto" style={{ height: "100%" }}>
      <Stack gap={0} p="md">
        <Text size="xs" fw={500} c="dimmed" tt="uppercase" mb="sm">
          Menu
        </Text>
        {navItems.map((item) => {
          const locked = item.featureKey ? !hasFeature(item.featureKey) : false;

          const link = (
            <NavLink
              key={item.href}
              component={Link}
              href={item.href}
              label={item.label}
              leftSection={<item.icon size={20} stroke={1.5} />}
              rightSection={
                locked ? (
                  <IconLock size={14} style={{ opacity: 0.45 }} />
                ) : undefined
              }
              active={pathname === item.href}
              style={locked ? { opacity: 0.6 } : undefined}
            />
          );

          if (locked) {
            return (
              <Tooltip
                key={item.href}
                label="Requiere plan Business o superior"
                position="right"
                withArrow
              >
                <div>{link}</div>
              </Tooltip>
            );
          }

          return link;
        })}
      </Stack>
    </ScrollArea>
  );
};

export default AppSidebar;
