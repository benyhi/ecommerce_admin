"use client";

import {
  ActionIcon,
  Burger,
  Group,
  useMantineColorScheme,
} from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";
import React from "react";

import NotificationDropdown from "@/components/header/NotificationDropdown";
import UserDropdown from "@/components/header/UserDropdown";
import { useSidebar } from "@/context/SidebarContext";

const AppHeader: React.FC = () => {
  const { mobileOpened, desktopOpened, toggleMobile, toggleDesktop } =
    useSidebar();
  const { toggleColorScheme } = useMantineColorScheme();

  return (
    <Group h="100%" px="md" justify="space-between">
      <Group>
        <Burger
          opened={mobileOpened}
          onClick={toggleMobile}
          hiddenFrom="sm"
          size="sm"
        />
        <Burger
          opened={desktopOpened}
          onClick={toggleDesktop}
          visibleFrom="sm"
          size="sm"
        />
      </Group>

      <Group gap="xs">
        <ActionIcon
          variant="default"
          size="lg"
          onClick={toggleColorScheme}
          aria-label="Toggle color scheme"
        >
          <IconSun size={18} className="icon-show-on-dark" />
          <IconMoon size={18} className="icon-show-on-light" />
        </ActionIcon>
        <NotificationDropdown />
        <UserDropdown />
      </Group>
    </Group>
  );
};

export default AppHeader;