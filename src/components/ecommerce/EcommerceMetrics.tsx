"use client";

import { Badge, Card, Group, SimpleGrid, Text, ThemeIcon } from "@mantine/core";
import { IconArrowDown, IconArrowUp, IconBox, IconUsers } from "@tabler/icons-react";
import React from "react";

const metrics = [
  {
    label: "Customers",
    value: "3,782",
    change: 11.01,
    icon: IconUsers,
  },
  {
    label: "Orders",
    value: "5,359",
    change: -9.05,
    icon: IconBox,
  },
];

export const EcommerceMetrics = () => {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }}>
      {metrics.map((m) => {
        const positive = m.change >= 0;
        return (
          <Card key={m.label} shadow="sm" padding="lg" radius="lg">
            <ThemeIcon variant="light" size="xl" radius="md" color="gray">
              <m.icon size={24} />
            </ThemeIcon>

            <Group justify="space-between" mt="md" align="flex-end">
              <div>
                <Text size="sm" c="dimmed">{m.label}</Text>
                <Text fw={700} size="xl" mt={4}>{m.value}</Text>
              </div>
              <Badge
                color={positive ? "teal" : "red"}
                variant="light"
                leftSection={
                  positive
                    ? <IconArrowUp size={14} />
                    : <IconArrowDown size={14} />
                }
              >
                {Math.abs(m.change)}%
              </Badge>
            </Group>
          </Card>
        );
      })}
    </SimpleGrid>
  );
};