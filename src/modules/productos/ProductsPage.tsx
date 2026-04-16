"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  ActionIcon,
  Accordion,
  Badge,
  Box,
  Button,
  Drawer,
  Group,
  LoadingOverlay,
  Modal,
  NumberInput,
  Pagination,
  Select,
  Stack,
  Switch,
  Table,
  Text,
  Textarea,
  TextInput,
  Title,
  Divider,
} from "@mantine/core";
import {
  IconEdit,
  IconPlus,
  IconSearch,
  IconTrash,
  IconSettings,
} from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useDebouncedValue } from "@mantine/hooks";
import { useAuth } from "@/context/AuthContext";
import { httpClient } from "@/lib/api/httpClient";
import type { Product, Category, OptionGroup, Option } from "@/lib/api/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProductRow = Product & { category_detail?: { id: string; name: string; order: number } | null };

// ─── ProductsPage ─────────────────────────────────────────────────────────────

export function ProductsPage() {
  const { can } = useAuth();

  // Products state
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);

  // Categories for select
  const [categories, setCategories] = useState<Category[]>([]);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductRow | null>(null);

  // Options modal state
  const [optionsProduct, setOptionsProduct] = useState<ProductRow | null>(null);

  const canCreate = can("create", "productos");
  const canEdit = can("update", "productos");
  const canDelete = can("delete", "productos");

  // Load categories once
  useEffect(() => {
    httpClient
      .get<{ results: Category[] } | Category[]>("/api/admin/catalog/categories/")
      .then((res) => {
        const list = Array.isArray(res) ? res : res.results ?? [];
        setCategories(list);
      })
      .catch(() => {});
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page };
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await httpClient.get<{ count: number; results: ProductRow[] } | ProductRow[]>(
        "/api/admin/catalog/products/",
        params
      );
      if (Array.isArray(res)) {
        setProducts(res);
        setTotal(res.length);
      } else {
        setProducts(res.results ?? []);
        setTotal(res.count ?? 0);
      }
    } catch {
      notifications.show({ color: "red", title: "Error", message: "No se pudieron cargar los productos." });
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleDelete = (product: ProductRow) => {
    modals.openConfirmModal({
      title: "Eliminar Producto",
      centered: true,
      labels: { confirm: "Eliminar", cancel: "Cancelar" },
      confirmProps: { color: "red" },
      children: (
        <Text size="sm">
          ¿Eliminar <b>{product.name}</b>? Esta acción no se puede deshacer.
        </Text>
      ),
      onConfirm: async () => {
        await httpClient.delete(`/api/admin/catalog/products/${product.id}/`);
        notifications.show({ color: "green", title: "Eliminado", message: "Producto eliminado." });
        loadProducts();
      },
    });
  };

  const openCreate = () => {
    setEditProduct(null);
    setDrawerOpen(true);
  };

  const openEdit = (product: ProductRow) => {
    setEditProduct(product);
    setDrawerOpen(true);
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <Box pos="relative">
      <LoadingOverlay visible={loading} zIndex={10} />
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={2}>Productos</Title>
            <Text c="dimmed" size="sm">Catálogo de productos con precios y variantes.</Text>
          </div>
          {canCreate && (
            <Button leftSection={<IconPlus size={16} />} onClick={openCreate}>
              Nuevo
            </Button>
          )}
        </Group>

        <TextInput
          leftSection={<IconSearch size={16} />}
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => { setSearch(e.currentTarget.value); setPage(1); }}
          w={320}
        />

        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Producto</Table.Th>
              <Table.Th>Categoría</Table.Th>
              <Table.Th>Precio</Table.Th>
              <Table.Th>Estado</Table.Th>
              <Table.Th>Orden</Table.Th>
              <Table.Th w={140}>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {products.map((p) => (
              <Table.Tr key={p.id}>
                <Table.Td fw={500}>{p.name}</Table.Td>
                <Table.Td>{p.category_detail?.name ?? "-"}</Table.Td>
                <Table.Td>
                  {Number(p.price).toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })}
                </Table.Td>
                <Table.Td>
                  <Badge color={p.active ? "green" : "red"} variant="light">
                    {p.active ? "Activo" : "Inactivo"}
                  </Badge>
                </Table.Td>
                <Table.Td>{p.order}</Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon
                      variant="subtle"
                      color="blue"
                      title="Editar"
                      disabled={!canEdit}
                      onClick={() => openEdit(p)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="violet"
                      title="Variantes"
                      onClick={() => setOptionsProduct(p)}
                    >
                      <IconSettings size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      title="Eliminar"
                      disabled={!canDelete}
                      onClick={() => handleDelete(p)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
            {!products.length && !loading && (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Text c="dimmed" size="sm">Sin productos aún.</Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>

        <Group justify="space-between">
          <Text size="sm" c="dimmed">{`${products.length} de ${total} productos`}</Text>
          <Pagination total={totalPages} value={page} onChange={setPage} size="sm" />
        </Group>
      </Stack>

      {/* Product Edit/Create Drawer */}
      <ProductDrawer
        opened={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        product={editProduct}
        categories={categories}
        onSaved={() => { setDrawerOpen(false); loadProducts(); }}
      />

      {/* Options Management Modal */}
      {optionsProduct && (
        <OptionsModal
          product={optionsProduct}
          opened={Boolean(optionsProduct)}
          onClose={() => setOptionsProduct(null)}
        />
      )}
    </Box>
  );
}

// ─── ProductDrawer ────────────────────────────────────────────────────────────

type ProductDrawerProps = {
  opened: boolean;
  onClose: () => void;
  product: ProductRow | null;
  categories: Category[];
  onSaved: () => void;
};

function ProductDrawer({ opened, onClose, product, categories, onSaved }: ProductDrawerProps) {
  const isEdit = Boolean(product);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [active, setActive] = useState(true);
  const [order, setOrder] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form on open
  useEffect(() => {
    if (opened) {
      setName(product?.name ?? "");
      setDescription(product?.description ?? "");
      setPrice(Number(product?.price ?? 0));
      setCategoryId(
        product?.category_detail?.id ?? (product?.category as unknown as string) ?? null
      );
      setActive(product?.active ?? true);
      setOrder(product?.order ?? 0);
      setErrors({});
    }
  }, [opened, product]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Requerido";
    if (!price || price <= 0) e.price = "Debe ser mayor a 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = { name, description, price, category: categoryId, active, order };
      if (isEdit && product) {
        await httpClient.put(`/api/admin/catalog/products/${product.id}/`, payload);
        notifications.show({ color: "blue", title: "Actualizado", message: "Producto guardado." });
      } else {
        await httpClient.post("/api/admin/catalog/products/", payload);
        notifications.show({ color: "green", title: "Creado", message: "Producto creado." });
      }
      onSaved();
    } catch (err) {
      notifications.show({ color: "red", title: "Error", message: err instanceof Error ? err.message : "Error al guardar." });
    } finally {
      setSubmitting(false);
    }
  };

  const categoryOptions = categories.map((c) => ({ value: c.id as unknown as string, label: c.name }));

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={isEdit ? `Editar: ${product?.name}` : "Nuevo Producto"}
      position="right"
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Nombre"
            withAsterisk
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            error={errors.name}
          />
          <Textarea
            label="Descripción"
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
            autosize
            minRows={3}
          />
          <NumberInput
            label="Precio"
            withAsterisk
            value={price}
            onChange={(v) => setPrice(Number(v ?? 0))}
            thousandSeparator="."
            decimalSeparator=","
            error={errors.price}
          />
          <Select
            label="Categoría"
            data={categoryOptions}
            value={categoryId}
            onChange={setCategoryId}
            clearable
            searchable
            placeholder="Sin categoría"
          />
          <NumberInput
            label="Orden"
            value={order}
            onChange={(v) => setOrder(Number(v ?? 0))}
          />
          <Switch
            label="Activo"
            checked={active}
            onChange={(e) => setActive(e.currentTarget.checked)}
          />
          <Divider />
          <Group justify="flex-end">
            <Button variant="default" onClick={onClose}>Cancelar</Button>
            <Button type="submit" loading={submitting}>
              {isEdit ? "Guardar" : "Crear"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Drawer>
  );
}

// ─── OptionsModal ─────────────────────────────────────────────────────────────

type OptionsModalProps = {
  product: ProductRow;
  opened: boolean;
  onClose: () => void;
};

function OptionsModal({ product, opened, onClose }: OptionsModalProps) {
  const [groups, setGroups] = useState<OptionGroup[]>([]);
  const [loading, setLoading] = useState(false);

  const loadGroups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await httpClient.get<OptionGroup[] | { results: OptionGroup[] }>(
        `/api/admin/catalog/option-groups/`,
        { product: product.id as unknown as string }
      );
      setGroups(Array.isArray(res) ? res : res.results ?? []);
    } catch {
      notifications.show({ color: "red", title: "Error", message: "No se cargaron las variantes." });
    } finally {
      setLoading(false);
    }
  }, [product.id]);

  useEffect(() => {
    if (opened) loadGroups();
  }, [opened, loadGroups]);

  const addGroup = async () => {
    try {
      const g = await httpClient.post<OptionGroup>("/api/admin/catalog/option-groups/", {
        product: product.id,
        name: "Nuevo grupo",
        required: false,
        max_choices: 1,
        order: groups.length,
      });
      setGroups((prev) => [...prev, g]);
    } catch {
      notifications.show({ color: "red", title: "Error", message: "No se pudo crear el grupo." });
    }
  };

  const updateGroup = async (group: OptionGroup, patch: Partial<OptionGroup>) => {
    try {
      await httpClient.patch(`/api/admin/catalog/option-groups/${group.id}/`, patch);
      setGroups((prev) => prev.map((g) => (g.id === group.id ? { ...g, ...patch } : g)));
    } catch {
      notifications.show({ color: "red", title: "Error", message: "No se pudo actualizar el grupo." });
    }
  };

  const deleteGroup = (group: OptionGroup) => {
    modals.openConfirmModal({
      title: "Eliminar grupo",
      centered: true,
      labels: { confirm: "Eliminar", cancel: "Cancelar" },
      confirmProps: { color: "red" },
      children: <Text size="sm">¿Eliminar el grupo <b>{group.name}</b> y todas sus opciones?</Text>,
      onConfirm: async () => {
        await httpClient.delete(`/api/admin/catalog/option-groups/${group.id}/`);
        setGroups((prev) => prev.filter((g) => g.id !== group.id));
      },
    });
  };

  const addOption = async (group: OptionGroup) => {
    try {
      const opt = await httpClient.post<Option>("/api/admin/catalog/options/", {
        group: group.id,
        name: "Nueva opción",
        price: 0,
        active: true,
        order: group.options?.length ?? 0,
      });
      setGroups((prev) =>
        prev.map((g) =>
          g.id === group.id ? { ...g, options: [...(g.options ?? []), opt] } : g
        )
      );
    } catch {
      notifications.show({ color: "red", title: "Error", message: "No se pudo crear la opción." });
    }
  };

  const updateOption = async (groupId: string, opt: Option, patch: Partial<Option>) => {
    try {
      await httpClient.patch(`/api/admin/catalog/options/${opt.id}/`, patch);
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? { ...g, options: g.options.map((o) => (o.id === opt.id ? { ...o, ...patch } : o)) }
            : g
        )
      );
    } catch {
      notifications.show({ color: "red", title: "Error", message: "No se pudo actualizar la opción." });
    }
  };

  const deleteOption = async (groupId: string, opt: Option) => {
    await httpClient.delete(`/api/admin/catalog/options/${opt.id}/`);
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, options: g.options.filter((o) => o.id !== opt.id) } : g
      )
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Variantes: ${product.name}`}
      size="xl"
      scrollAreaComponent={undefined}
    >
      <Box pos="relative" mih={200}>
        <LoadingOverlay visible={loading} />
        <Stack gap="md">
          {groups.length === 0 && !loading && (
            <Text c="dimmed" size="sm" ta="center">Sin grupos de variantes. Agregá uno para comenzar.</Text>
          )}

          <Accordion multiple variant="separated">
            {groups.map((group) => (
              <Accordion.Item key={group.id} value={group.id}>
                <Accordion.Control>
                  <Group justify="space-between" pr="md">
                    <Text fw={600}>{group.name}</Text>
                    <Group gap="xs" onClick={(e) => e.stopPropagation()}>
                      <Badge size="sm" color="gray" variant="light">
                        {group.options?.length ?? 0} opciones
                      </Badge>
                    </Group>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <Stack gap="sm">
                    {/* Group settings */}
                    <Group gap="md" align="flex-end">
                      <TextInput
                        label="Nombre del grupo"
                        value={group.name}
                        onChange={(e) => updateGroup(group, { name: e.currentTarget.value })}
                        style={{ flex: 1 }}
                      />
                      <NumberInput
                        label="Máx. elecciones"
                        value={group.max_choices}
                        onChange={(v) => updateGroup(group, { max_choices: Number(v ?? 1) })}
                        w={130}
                        min={1}
                      />
                      <Switch
                        label="Obligatorio"
                        checked={group.required}
                        onChange={(e) => updateGroup(group, { required: e.currentTarget.checked })}
                      />
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        title="Eliminar grupo"
                        onClick={() => deleteGroup(group)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>

                    <Divider label="Opciones" labelPosition="left" />

                    {/* Options table */}
                    {(group.options ?? []).length > 0 && (
                      <Table withTableBorder withColumnBorders>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th>Nombre</Table.Th>
                            <Table.Th w={140}>Precio extra</Table.Th>
                            <Table.Th w={90}>Activo</Table.Th>
                            <Table.Th w={60}></Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {(group.options ?? []).map((opt) => (
                            <Table.Tr key={opt.id}>
                              <Table.Td>
                                <TextInput
                                  value={opt.name}
                                  onChange={(e) => updateOption(group.id, opt, { name: e.currentTarget.value })}
                                  size="xs"
                                />
                              </Table.Td>
                              <Table.Td>
                                <NumberInput
                                  value={Number(opt.price)}
                                  onChange={(v) => updateOption(group.id, opt, { price: String(v ?? 0) as unknown as string })}
                                  size="xs"
                                  thousandSeparator="."
                                  decimalSeparator=","
                                />
                              </Table.Td>
                              <Table.Td>
                                <Switch
                                  checked={opt.active}
                                  onChange={(e) => updateOption(group.id, opt, { active: e.currentTarget.checked })}
                                  size="sm"
                                />
                              </Table.Td>
                              <Table.Td>
                                <ActionIcon
                                  color="red"
                                  variant="subtle"
                                  size="sm"
                                  onClick={() => deleteOption(group.id, opt)}
                                >
                                  <IconTrash size={14} />
                                </ActionIcon>
                              </Table.Td>
                            </Table.Tr>
                          ))}
                        </Table.Tbody>
                      </Table>
                    )}

                    <Button
                      size="xs"
                      variant="light"
                      leftSection={<IconPlus size={12} />}
                      onClick={() => addOption(group)}
                    >
                      Agregar opción
                    </Button>
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>

          <Button
            variant="outline"
            leftSection={<IconPlus size={16} />}
            onClick={addGroup}
          >
            Agregar grupo de variantes
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}
