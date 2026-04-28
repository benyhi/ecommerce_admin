"use client";

import { NavLink, ScrollArea, Stack, Text } from "@mantine/core";
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
  IconSettings,
  IconSettings2,
  IconUser,
  IconUsers,
  IconWorld,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const navItems = [
  { icon: IconChartPie, label: "Metricas", href: "/metricas" },
  { icon: IconCashRegister, label: "Punto de Venta", href: "/pos" },
  { icon: IconCalendar, label: "Calendario", href: "/calendar" },
  { icon: IconUsers, label: "Clientes", href: "/clientes" },
  { icon: IconCategory, label: "Categorias", href: "/categorias" },
  { icon: IconBox, label: "Productos", href: "/productos" },
  { icon: IconClipboardList, label: "Pedidos", href: "/pedidos" },
  { icon: IconCreditCard, label: "Pagos", href: "/pagos" },
  { icon: IconSettings2, label: "Config. Pagos", href: "/configuracion-pagos" },
  { icon: IconDiscount2, label: "Cupones", href: "/cupones" },
  { icon: IconCloud, label: "Test Bucket", href: "/test-bucket" },
  { icon: IconWorld, label: "Sitio Web", href: "/sitio" },
  { icon: IconUser, label: "Usuarios", href: "/usuarios" },
  { icon: IconSettings, label: "Configuracion", href: "/configuracion" },
];

const AppSidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <ScrollArea type="auto" style={{ height: "100%" }}>
      <Stack gap={0} p="md">
        <Text size="xs" fw={500} c="dimmed" tt="uppercase" mb="sm">
          Menu
        </Text>
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            component={Link}
            href={item.href}
            label={item.label}
            leftSection={<item.icon size={20} stroke={1.5} />}
            active={pathname === item.href}
          />
        ))}
      </Stack>
    </ScrollArea>
  );
};

export default AppSidebar;