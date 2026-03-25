"use client";

import { Card, Group, SimpleGrid, Stack, Table, Text, Title } from "@mantine/core";

import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import { ResourcePage } from "@/modules/resources/ResourcePage";

const topProducts = [
  { name: "Auriculares ANC", sku: "ANC-9823", ventas: 420, ingreso: 54420 },
  { name: "Sudadera básica", sku: "CL-4401", ventas: 360, ingreso: 21564 },
  { name: "Lámpara escritorio", sku: "LG-1882", ventas: 290, ingreso: 11455 },
  { name: "Monitor 27''", sku: "MN-2701", ventas: 185, ingreso: 46250 },
];

export function MetricasContent() {
  return (
    <Stack gap="lg">
      <Title order={2}>Metricas</Title>

      <EcommerceMetrics />

      <SimpleGrid cols={{ base: 1, xl: 3 }}>
        <Card shadow="sm" padding="lg" radius="lg" style={{ gridColumn: "span 2" }}>
          <Group justify="space-between" mb="sm">
            <div>
              <Text fw={600}>Tendencia mensual</Text>
              <Text size="sm" c="dimmed">Ventas en el año</Text>
            </div>
          </Group>
          <MonthlySalesChart />
        </Card>

        <Card shadow="sm" padding="lg" radius="lg">
          <Text fw={600} mb="sm">Productos más vendidos</Text>
          <Table highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Producto</Table.Th>
                <Table.Th>SKU</Table.Th>
                <Table.Th>Ventas</Table.Th>
                <Table.Th>Ingreso</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {topProducts.map((item) => (
                <Table.Tr key={item.sku}>
                  <Table.Td>{item.name}</Table.Td>
                  <Table.Td>{item.sku}</Table.Td>
                  <Table.Td>{item.ventas.toLocaleString("es-CL")}</Table.Td>
                  <Table.Td>
                    {item.ingreso.toLocaleString("es-CL", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      </SimpleGrid>

      <Card shadow="sm" padding="lg" radius="lg">
        <Group justify="space-between" mb="md">
          <div>
            <Text fw={600}>Detalle y CRUD</Text>
            <Text size="sm" c="dimmed">
              Gestiona métricas con filtros, búsquedas y permisos.
            </Text>
          </div>
        </Group>
        <ResourcePage resource="metricas" />
      </Card>
    </Stack>
  );
}