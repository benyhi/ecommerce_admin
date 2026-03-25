"use client";

import { ActionIcon, Indicator, Menu, Text, Group, Avatar } from "@mantine/core";
import { IconBell, IconX } from "@tabler/icons-react";
import React, { useState } from "react";

const notifications = [
  {
    id: 1,
    user: "Terry Franci",
    avatar: "/images/user/user-02.jpg",
    action: "requests permission to change",
    target: "Project - Nganter App",
    category: "Project",
    time: "5 min ago",
  },
  {
    id: 2,
    user: "Alena Franci",
    avatar: "/images/user/user-03.jpg",
    action: "requests permission to change",
    target: "Project - Nganter App",
    category: "Project",
    time: "8 min ago",
  },
  {
    id: 3,
    user: "Jocelyn Kenter",
    avatar: "/images/user/user-04.jpg",
    action: "requests permission to change",
    target: "Project - Nganter App",
    category: "Project",
    time: "15 min ago",
  },
];

export default function NotificationDropdown() {
  const [notifying, setNotifying] = useState(true);

  return (
    <Menu id="notification-menu" shadow="md" width={360} position="bottom-end">
      <Menu.Target>
        <Indicator disabled={!notifying} color="orange" size={8} offset={4} processing>
          <ActionIcon
            variant="default"
            size="lg"
            onClick={() => setNotifying(false)}
            aria-label="Notifications"
          >
            <IconBell size={20} />
          </ActionIcon>
        </Indicator>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>
          <Text fw={600} size="lg">
            Notifications
          </Text>
        </Menu.Label>

        {notifications.map((n) => (
          <Menu.Item key={n.id} py="sm">
            <Group gap="sm" wrap="nowrap" align="flex-start">
              <Avatar src={n.avatar} size={40} radius="xl" />
              <div>
                <Text size="sm">
                  <Text span fw={600}>{n.user}</Text>{" "}
                  {n.action}{" "}
                  <Text span fw={600}>{n.target}</Text>
                </Text>
                <Group gap="xs" mt={4}>
                  <Text size="xs" c="dimmed">{n.category}</Text>
                  <Text size="xs" c="dimmed">·</Text>
                  <Text size="xs" c="dimmed">{n.time}</Text>
                </Group>
              </div>
            </Group>
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}