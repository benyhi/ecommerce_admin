"use client";

import { useState } from "react";
import {
  Badge, Button, Card, Center, Group, Loader, Stack, Table, Text, Title, ThemeIcon,
} from "@mantine/core";
import { IconCheck, IconCloudUpload, IconRefresh, IconX } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { cloudAdmin, type BucketTestResult } from "@/lib/api/services/cloud.service";

const STEP_LABELS: Record<string, string> = {
  connect: "Conexión al bucket",
  upload: "Subir archivo de prueba",
  read: "Leer archivo (HEAD)",
  delete: "Eliminar archivo de prueba",
};

export default function BucketTestContent() {
  const [result, setResult] = useState<BucketTestResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function runTest() {
    setLoading(true);
    setResult(null);
    try {
      const res = await cloudAdmin.testBucket();
      setResult(res);
      if (res.ok) {
        notifications.show({ color: "green", message: "Todos los pasos del bucket pasaron correctamente" });
      } else {
        notifications.show({ color: "red", message: "Algunos pasos fallaron — revisá el reporte" });
      }
    } catch {
      notifications.show({ color: "red", message: "Error al comunicarse con el servidor" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Stack gap="md" p="md">
      <Group justify="space-between">
        <div>
          <Title order={3}>Test de bucket S3 / R2</Title>
          <Text c="dimmed" size="sm" mt={4}>
            Verifica que el almacenamiento en la nube funcione correctamente: conexión, subida, lectura y eliminación.
          </Text>
        </div>
        <Button
          leftSection={loading ? <Loader size={16} color="white" /> : <IconRefresh size={16} />}
          onClick={runTest}
          disabled={loading}
          color="indigo"
        >
          {loading ? "Probando..." : "Ejecutar test"}
        </Button>
      </Group>

      {!result && !loading && (
        <Center py="xl">
          <Stack align="center" gap="xs">
            <ThemeIcon size={56} radius="xl" variant="light" color="indigo">
              <IconCloudUpload size={28} />
            </ThemeIcon>
            <Text c="dimmed" size="sm">Presioná "Ejecutar test" para verificar el bucket</Text>
          </Stack>
        </Center>
      )}

      {loading && (
        <Center py="xl">
          <Stack align="center" gap="sm">
            <Loader size="lg" />
            <Text c="dimmed" size="sm">Ejecutando pruebas de conexión...</Text>
          </Stack>
        </Center>
      )}

      {result && (
        <Stack gap="md">
          <Card withBorder radius="md" padding="md">
            <Group>
              <ThemeIcon
                size={40}
                radius="xl"
                color={result.ok ? "green" : "red"}
                variant="light"
              >
                {result.ok ? <IconCheck size={22} /> : <IconX size={22} />}
              </ThemeIcon>
              <div>
                <Text fw={700} size="lg">
                  {result.ok ? "Bucket operativo" : "Se detectaron errores"}
                </Text>
                <Text size="sm" c="dimmed">
                  {result.steps.filter((s) => s.ok).length} de {result.steps.length} pasos completados correctamente
                </Text>
              </div>
              <Badge
                ml="auto"
                size="lg"
                color={result.ok ? "green" : "red"}
                variant="light"
              >
                {result.ok ? "OK" : "ERROR"}
              </Badge>
            </Group>
          </Card>

          <Card withBorder radius="md" padding={0}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Paso</Table.Th>
                  <Table.Th>Estado</Table.Th>
                  <Table.Th>Tiempo</Table.Th>
                  <Table.Th>Detalle</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {result.steps.map((step) => (
                  <Table.Tr key={step.step}>
                    <Table.Td>
                      <Text size="sm" fw={500}>
                        {STEP_LABELS[step.step] ?? step.step}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={step.ok ? "green" : "red"} variant="light">
                        {step.ok ? "OK" : "FALLÓ"}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">{step.ms} ms</Text>
                    </Table.Td>
                    <Table.Td>
                      {step.error ? (
                        <Text size="xs" c="red" style={{ maxWidth: 360, wordBreak: "break-word" }}>
                          {step.error}
                        </Text>
                      ) : step.detail ? (
                        <Text size="xs" c="dimmed">{step.detail}</Text>
                      ) : (
                        <Text size="xs" c="dimmed">—</Text>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        </Stack>
      )}
    </Stack>
  );
}
