"use client";

import { Avatar, Group, Menu, Text } from "@mantine/core";
import { IconInfoCircle, IconLogout, IconUser } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

import { useAuth } from "@/context/AuthContext";

export default function UserDropdown() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    logout();
    router.push("/signin");
  };

  return (
    <Menu id="user-menu" shadow="md" width={240} position="bottom-end">
      <Menu.Target>
        <Group gap="xs" style={{ cursor: "pointer" }}>
          <Avatar size={40} radius="xl" color="blue">
            {user?.email?.charAt(0).toUpperCase() ?? "?"}
          </Avatar>
          <Text fw={500} size="sm" visibleFrom="sm">
            {user?.email ?? "Usuario"}
          </Text>
        </Group>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>
          <Text fw={600}>{user?.email ?? "Sin sesión"}</Text>
          <Text size="xs" c="dimmed">{user?.role ?? ""}</Text>
        </Menu.Label>

        <Menu.Divider />

        <Menu.Item
          leftSection={<IconUser size={18} />}
          component={Link}
          href="/profile"
        >
          Edit profile
        </Menu.Item>
        <Menu.Item
          leftSection={<IconInfoCircle size={18} />}
          component={Link}
          href="/profile"
        >
          Support
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item
          leftSection={<IconLogout size={18} />}
          color="red"
          onClick={handleSignOut}
        >
          Sign out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}