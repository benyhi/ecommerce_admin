"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Image,
  LoadingOverlay,
  Modal,
  NumberInput,
  Select,
  Stack,
  Switch,
  Table,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import { IconPlus, IconTrash, IconPhoto } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { ResourcePage } from "@/modules/resources/ResourcePage";
import { httpClient } from "@/lib/api/httpClient";
import type { FeaturedProductItem, Product } from "@/lib/api/types";

// ─── SitioPage (tabbed) ───────────────────────────────────────────────────────

export function SitioPage() {
  return (
    <Stack gap="md">
      <div>
        <Title order={2}>Sitio Web</Title>
        <Text c="dimmed" size="sm">
          Administrá el contenido de la página de inicio: carrusel, productos destacados y publicaciones.
        </Text>
      </div>

      <Tabs defaultValue="carrusel" keepMounted={false}>
        <Tabs.List>
          <Tabs.Tab value="carrusel">Carrusel</Tabs.Tab>
          <Tabs.Tab value="destacados">Destacados</Tabs.Tab>
          <Tabs.Tab value="publicaciones">Publicaciones</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="carrusel" pt="md">
          <ResourcePage resource="sitio-carrusel" />
        </Tabs.Panel>

        <Tabs.Panel value="destacados" pt="md">
          <FeaturedProductsManager />
        </Tabs.Panel>

        <Tabs.Panel value="publicaciones" pt="md">
          <ResourcePage resource="sitio-publicaciones" />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

// ─── FeaturedProductsManager ──────────────────────────────────────────────────

function FeaturedProductsManager() {
  const [featured, setFeatured] = useState<FeaturedProductItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await httpClient.get<FeaturedProductItem[] | { results: FeaturedProductItem[] }>(
        "/api/admin/site/featured/"
      );
      setFeatured(Array.isArray(res) ? res : res.results ?? []);
    } catch {
      notifications.show({ color: "red", title: "Error", message: "No se cargaron los destacados." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRemove = (item: FeaturedProductItem) => {
    modals.openConfirmModal({
      title: "Quitar destacado",
      centered: true,
      labels: { confirm: "Quitar", cancel: "Cancelar" },
      confirmProps: { color: "red" },
      children: (
        <Text size="sm">
          ¿Quitar <b>{item.product_detail?.name}</b> de los destacados?
        </Text>
      ),
      onConfirm: async () => {
        await httpClient.delete(`/api/admin/site/featured/${item.id}/`);
        notifications.show({ color: "green", title: "Quitado", message: "Producto quitado de destacados." });
        load();
      },
    });
  };

  const handleToggleActive = async (item: FeaturedProductItem) => {
    await httpClient.patch(`/api/admin/site/featured/${item.id}/`, { active: !item.active });
    setFeatured((prev) =>
      prev.map((f) => (f.id === item.id ? { ...f, active: !f.active } : f))
    );
  };

  const handleOrderChange = async (item: FeaturedProductItem, newOrder: number) => {
    await httpClient.patch(`/api/admin/site/featured/${item.id}/`, { order: newOrder });
    setFeatured((prev) =>
      prev.map((f) => (f.id === item.id ? { ...f, order: newOrder } : f))
    );
  };

  return (
    <Box pos="relative">
      <LoadingOverlay visible={loading} />
      <Stack gap="md">
        <Group justify="space-between">
          <div>
            <Title order={3}>Productos Destacados</Title>
            <Text c="dimmed" size="sm">
              Seleccioná qué productos aparecen en la sección "Destacados" de la home.
            </Text>
          </div>
          <Button leftSection={<IconPlus size={16} />} onClick={() => setPickerOpen(true)}>
            Agregar destacado
          </Button>
        </Group>

        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={60}></Table.Th>
              <Table.Th>Producto</Table.Th>
              <Table.Th>Categoría</Table.Th>
              <Table.Th>Precio</Table.Th>
              <Table.Th w={100}>Orden</Table.Th>
              <Table.Th w={90}>Visible</Table.Th>
              <Table.Th w={60}></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {featured.map((item) => (
              <Table.Tr key={item.id}>
                <Table.Td>
                  {item.product_detail?.image_url ? (
                    <Image
                      src={item.product_detail.image_url}
                      w={40}
                      h={40}
                      radius="sm"
                      fit="cover"
                      fallbackSrc={undefined}
                    />
                  ) : (
                    <Box w={40} h={40} bg="gray.1" style={{ borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <IconPhoto size={18} color="gray" />
                    </Box>
                  )}
                </Table.Td>
                <Table.Td fw={500}>{item.product_detail?.name ?? item.product}</Table.Td>
                <Table.Td>
                  {item.product_detail?.subcategory_detail
                    ? `${item.product_detail.category_detail?.name ?? "-"} / ${item.product_detail.subcategory_detail.name}`
                    : item.product_detail?.category_detail?.name ?? "-"}
                </Table.Td>
                <Table.Td>
                  {item.product_detail
                    ? Number(item.product_detail.price).toLocaleString("es-AR", {
                        style: "currency",
                        currency: "ARS",
                        maximumFractionDigits: 0,
                      })
                    : "-"}
                </Table.Td>
                <Table.Td>
                  <NumberInput
                    value={item.order}
                    onChange={(v) => handleOrderChange(item, Number(v ?? 0))}
                    size="xs"
                    w={80}
                    min={0}
                  />
                </Table.Td>
                <Table.Td>
                  <Switch
                    checked={item.active}
                    onChange={() => handleToggleActive(item)}
                    size="sm"
                  />
                </Table.Td>
                <Table.Td>
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    onClick={() => handleRemove(item)}
                    title="Quitar"
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
            {featured.length === 0 && !loading && (
              <Table.Tr>
                <Table.Td colSpan={7}>
                  <Text c="dimmed" size="sm">Sin productos destacados. Agregá uno.</Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Stack>

      {/* Product Picker Modal */}
      <ProductPickerModal
        opened={pickerOpen}
        onClose={() => setPickerOpen(false)}
        excludeIds={featured.map((f) => f.product)}
        onAdd={async (productId) => {
          await httpClient.post("/api/admin/site/featured/", {
            product: productId,
            order: featured.length,
            active: true,
          });
          notifications.show({ color: "green", title: "Agregado", message: "Producto agregado a destacados." });
          setPickerOpen(false);
          load();
        }}
      />
    </Box>
  );
}

// ─── ProductPickerModal ───────────────────────────────────────────────────────

type ProductPickerProps = {
  opened: boolean;
  onClose: () => void;
  excludeIds: string[];
  onAdd: (productId: string) => Promise<void>;
};

function ProductPickerModal({ opened, onClose, excludeIds, onAdd }: ProductPickerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!opened) return;
    setSelected(null);
    setLoading(true);
    httpClient
      .get<Product[] | { results: Product[] }>("/api/admin/catalog/products/")
      .then((res) => {
        const all = Array.isArray(res) ? res : res.results ?? [];
        setProducts(all.filter((p) => !excludeIds.includes(p.id)));
      })
      .catch(() => {
        notifications.show({ color: "red", title: "Error", message: "No se cargaron los productos." });
      })
      .finally(() => setLoading(false));
  }, [opened, excludeIds]);

  const productOptions = products.map((p) => ({
    value: p.id,
    label: `${p.name}${(p as unknown as Record<string, unknown>).category_detail ? ` — ${((p as unknown as Record<string, unknown>).category_detail as Record<string, unknown>)?.name}` : ""}${(p as unknown as Record<string, unknown>).subcategory_detail ? ` / ${((p as unknown as Record<string, unknown>).subcategory_detail as Record<string, unknown>)?.name}` : ""}`,
  }));

  const handleAdd = async () => {
    if (!selected) return;
    setAdding(true);
    try {
      await onAdd(selected);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Agregar producto destacado" size="md">
      <LoadingOverlay visible={loading} />
      <Stack gap="md">
        <Select
          label="Seleccioná un producto"
          data={productOptions}
          value={selected}
          onChange={setSelected}
          searchable
          clearable
          placeholder="Buscar producto..."
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleAdd} loading={adding} disabled={!selected}>
            Agregar
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
