"use client";

import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Indicator,
  Loader,
  Menu,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconBell,
  IconCheck,
  IconPackage,
  IconCreditCard,
  IconTruck,
  IconAlertTriangle,
  IconUser,
  IconShoppingCart,
  IconX,
} from "@tabler/icons-react";
import React, { useCallback, useEffect, useState } from "react";
import { notificationsService } from "@/lib/api/services/notifications.service";
import type { Notification, NotificationType } from "@/lib/api/types";

// ── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

const TYPE_META: Record<
  NotificationType,
  { icon: React.ReactNode; color: string }
> = {
  new_order: { icon: <IconShoppingCart size={14} />, color: "blue" },
  order_confirmed: { icon: <IconCheck size={14} />, color: "green" },
  order_processing: { icon: <IconPackage size={14} />, color: "indigo" },
  order_shipped: { icon: <IconTruck size={14} />, color: "cyan" },
  order_delivered: { icon: <IconCheck size={14} />, color: "teal" },
  order_cancelled: { icon: <IconX size={14} />, color: "red" },
  payment_received: { icon: <IconCreditCard size={14} />, color: "green" },
  payment_failed: { icon: <IconCreditCard size={14} />, color: "red" },
  low_stock: { icon: <IconAlertTriangle size={14} />, color: "orange" },
  shipment_update: { icon: <IconTruck size={14} />, color: "violet" },
  new_user: { icon: <IconUser size={14} />, color: "grape" },
};

// ── Component ─────────────────────────────────────────────────────────────────

const POLL_MS = 30_000;

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCount = useCallback(async () => {
    try {
      const { count } = await notificationsService.unreadCount();
      setUnread(count);
    } catch {
      // silently ignore
    }
  }, []);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationsService.list({ page: 1 });
      setNotifications(res.results);
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll unread count every 30 s
  useEffect(() => {
    fetchCount();
    const id = setInterval(fetchCount, POLL_MS);
    return () => clearInterval(id);
  }, [fetchCount]);

  // Load full list when dropdown opens
  useEffect(() => {
    if (open) fetchList();
  }, [open, fetchList]);

  const handleMarkRead = async (id: string) => {
    try {
      const updated = await notificationsService.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? updated : n))
      );
      setUnread((c) => Math.max(0, c - 1));
    } catch {
      // silently ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnread(0);
    } catch {
      // silently ignore
    }
  };

  return (
    <Menu
      opened={open}
      onChange={setOpen}
      shadow="md"
      width={380}
      position="bottom-end"
    >
      <Menu.Target>
        <Tooltip label="Notificaciones" withArrow>
          <Indicator
            disabled={unread === 0}
            color="orange"
            size={unread > 9 ? 16 : 14}
            label={unread > 9 ? "9+" : String(unread)}
            offset={4}
            processing={unread > 0}
          >
            <ActionIcon variant="default" size="lg" aria-label="Notificaciones">
              <IconBell size={20} />
            </ActionIcon>
          </Indicator>
        </Tooltip>
      </Menu.Target>

      <Menu.Dropdown>
        {/* Header */}
        <Group px="sm" py="xs" justify="space-between">
          <Text fw={600} size="md">
            Notificaciones
          </Text>
          {unread > 0 && (
            <Button
              variant="subtle"
              size="xs"
              onClick={handleMarkAllRead}
              leftSection={<IconCheck size={12} />}
            >
              Marcar todo como leído
            </Button>
          )}
        </Group>

        <Divider />

        {/* List */}
        <ScrollArea.Autosize mah={420}>
          {loading ? (
            <Box p="md" ta="center">
              <Loader size="sm" />
            </Box>
          ) : notifications.length === 0 ? (
            <Box p="xl" ta="center">
              <Text c="dimmed" size="sm">
                Sin notificaciones
              </Text>
            </Box>
          ) : (
            <Stack gap={0}>
              {notifications.map((n) => {
                const meta = TYPE_META[n.type] ?? {
                  icon: <IconBell size={14} />,
                  color: "gray",
                };
                return (
                  <Box
                    key={n.id}
                    px="sm"
                    py="xs"
                    bg={n.is_read ? undefined : "var(--mantine-color-blue-0)"}
                    style={{ cursor: n.is_read ? "default" : "pointer" }}
                    onClick={() => !n.is_read && handleMarkRead(n.id)}
                  >
                    <Group gap="sm" wrap="nowrap" align="flex-start">
                      <ThemeIcon
                        color={meta.color}
                        variant="light"
                        size="sm"
                        radius="xl"
                        mt={2}
                      >
                        {meta.icon}
                      </ThemeIcon>
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Group gap={4} wrap="nowrap">
                          <Text size="sm" fw={n.is_read ? 400 : 600} truncate>
                            {n.title}
                          </Text>
                          {!n.is_read && (
                            <Badge size="xs" color="blue" variant="filled" circle />
                          )}
                        </Group>
                        {n.body && (
                          <Text size="xs" c="dimmed" lineClamp={2}>
                            {n.body}
                          </Text>
                        )}
                        <Text size="xs" c="dimmed" mt={2}>
                          {n.type_display} · {timeAgo(n.created_at)}
                        </Text>
                      </Box>
                    </Group>
                  </Box>
                );
              })}
            </Stack>
          )}
        </ScrollArea.Autosize>

        {notifications.length > 0 && (
          <>
            <Divider />
            <Box px="sm" py="xs" ta="center">
              <Text size="xs" c="dimmed">
                Mostrando las últimas {notifications.length} notificaciones
              </Text>
            </Box>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
