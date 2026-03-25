"use client";

import { NavLink, ScrollArea, Stack, Text } from "@mantine/core";
import {
  IconBox,
  IconCalendar,
  IconCashRegister,
  IconCategory,
  IconChartPie,
  IconClipboardList,
  IconSettings,
  IconUser,
  IconUsers,
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