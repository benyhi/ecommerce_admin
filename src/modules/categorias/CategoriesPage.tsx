"use client";

import {
  Accordion,
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  LoadingOverlay,
  NumberInput,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconPlus, IconSearch, IconTrash, IconX } from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { categoriesAdmin, subcategoriesAdmin } from "@/lib/api/services/admin.service";
import type { Category, PaginatedResponse, Subcategory } from "@/lib/api/types";

type CategoryFormValues = {
  name: string;
  order: number;
  active: boolean;
};

type SubcategoryDraft = {
  name: string;
  active: boolean;
};

const unwrapRows = <T,>(result: PaginatedResponse<T> | T[]): T[] => {
  return Array.isArray(result) ? result : result.results ?? [];
};

const getSubcategoryCategoryId = (subcategory: Subcategory): string | null => {
  if (typeof subcategory.category === "string") return subcategory.category;
  return subcategory.category_detail?.id ?? null;
};

export function CategoriesPage() {
  const { can } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canCreate = can("create", "categorias");
  const canEdit = can("update", "categorias");
  const canDelete = can("delete", "categorias");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [categoryResult, subcategoryResult] = await Promise.all([
        categoriesAdmin.list(search ? { search } : undefined),
        subcategoriesAdmin.list(),
      ]);
      setCategories(unwrapRows<Category>(categoryResult as PaginatedResponse<Category> | Category[]));
      setSubcategories(unwrapRows<Subcategory>(subcategoryResult as PaginatedResponse<Subcategory> | Subcategory[]));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar categorias.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const subcategoriesByCategory = useMemo(() => {
    const groups = new Map<string, Subcategory[]>();
    for (const subcategory of subcategories) {
      const categoryId = getSubcategoryCategoryId(subcategory);
      if (!categoryId) continue;
      const current = groups.get(categoryId) ?? [];
      current.push(subcategory);
      groups.set(categoryId, current);
    }
    return groups;
  }, [subcategories]);

  const openCategoryForm = (category?: Category) => {
    modals.open({
      title: category ? "Editar categoria" : "Nueva categoria",
      size: "md",
      children: (
        <CategoryForm
          initialValues={{
            name: category?.name ?? "",
            order: category?.order ?? 0,
            active: category?.active ?? true,
          }}
          onSubmit={async (values) => {
            if (category) {
              await categoriesAdmin.update(category.id, values);
              notifications.show({ color: "blue", title: "Categoria actualizada", message: "Cambios guardados." });
            } else {
              await categoriesAdmin.create(values);
              notifications.show({ color: "green", title: "Categoria creada", message: "Guardado correctamente." });
            }
            modals.closeAll();
            await loadData();
          }}
        />
      ),
    });
  };

  const updateSubcategory = async (subcategory: Subcategory, patch: Partial<SubcategoryDraft>) => {
    const categoryId = getSubcategoryCategoryId(subcategory);
    if (!categoryId) return;

    await subcategoriesAdmin.update(subcategory.id, {
      category: categoryId,
      name: patch.name ?? subcategory.name,
      active: patch.active ?? subcategory.active,
    });
    await loadData();
  };

  const createSubcategory = async (category: Category, draft: SubcategoryDraft) => {
    await subcategoriesAdmin.create({
      category: category.id,
      name: draft.name,
      active: draft.active,
    });
    notifications.show({ color: "green", title: "Subcategoria creada", message: "Guardado correctamente." });
    await loadData();
  };

  const deleteCategory = (category: Category) => {
    modals.openConfirmModal({
      title: "Eliminar categoria",
      centered: true,
      labels: { confirm: "Eliminar", cancel: "Cancelar" },
      confirmProps: { color: "red" },
      children: (
        <Text size="sm">
          Seguro que deseas eliminar <b>{category.name}</b>? Tambien se eliminaran sus subcategorias.
        </Text>
      ),
      onConfirm: async () => {
        await categoriesAdmin.remove(category.id);
        notifications.show({ color: "green", title: "Categoria eliminada", message: "Se elimino correctamente." });
        await loadData();
      },
    });
  };

  const deleteSubcategory = (subcategory: Subcategory) => {
    modals.openConfirmModal({
      title: "Eliminar subcategoria",
      centered: true,
      labels: { confirm: "Eliminar", cancel: "Cancelar" },
      confirmProps: { color: "red" },
      children: (
        <Text size="sm">
          Seguro que deseas eliminar <b>{subcategory.name}</b>?
        </Text>
      ),
      onConfirm: async () => {
        await subcategoriesAdmin.remove(subcategory.id);
        notifications.show({ color: "green", title: "Subcategoria eliminada", message: "Se elimino correctamente." });
        await loadData();
      },
    });
  };

  return (
    <Box pos="relative">
      <LoadingOverlay visible={loading} zIndex={10} />
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={2}>Categorias</Title>
            <Text c="dimmed" size="sm">
              Gestiona categorias y sus subcategorias desde una sola vista.
            </Text>
          </div>
          {canCreate && (
            <Button leftSection={<IconPlus size={16} />} onClick={() => openCategoryForm()}>
              Nueva categoria
            </Button>
          )}
        </Group>

        {error && (
          <Text c="red" size="sm" fw={500}>
            Error: {error}
          </Text>
        )}

        <TextInput
          leftSection={<IconSearch size={16} />}
          placeholder="Buscar categorias..."
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          w={320}
        />

        <Table
          striped
          highlightOnHover
          withTableBorder
          withColumnBorders
          style={{ tableLayout: "fixed" }}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={220}>Categoria</Table.Th>
              <Table.Th w={90}>Orden</Table.Th>
              <Table.Th w={110}>Estado</Table.Th>
              <Table.Th>Subcategorias</Table.Th>
              <Table.Th w={120}>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {categories.map((category) => {
              const children = subcategoriesByCategory.get(category.id) ?? [];

              return (
                <Table.Tr key={category.id}>
                  <Table.Td fw={600} style={{ verticalAlign: "top" }}>{category.name}</Table.Td>
                  <Table.Td style={{ verticalAlign: "top" }}>{category.order}</Table.Td>
                  <Table.Td style={{ verticalAlign: "top" }}>
                    <Badge color={category.active ? "green" : "red"} variant="light">
                      {category.active ? "Activo" : "Inactivo"}
                    </Badge>
                  </Table.Td>
                  <Table.Td style={{ verticalAlign: "top" }}>
                    <SubcategoryDropdown
                      category={category}
                      subcategories={children}
                      canCreate={canCreate}
                      canEdit={canEdit}
                      canDelete={canDelete}
                      onCreate={createSubcategory}
                      onUpdate={updateSubcategory}
                      onDelete={deleteSubcategory}
                    />
                  </Table.Td>
                  <Table.Td style={{ verticalAlign: "top" }}>
                    <Group gap="xs">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        aria-label="Editar categoria"
                        disabled={!canEdit}
                        onClick={() => openCategoryForm(category)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        aria-label="Eliminar categoria"
                        disabled={!canDelete}
                        onClick={() => deleteCategory(category)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              );
            })}

            {!categories.length && !loading && (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Text c="dimmed" size="sm">
                    Sin categorias aun.
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Stack>
    </Box>
  );
}

function SubcategoryDropdown({
  category,
  subcategories,
  canCreate,
  canEdit,
  canDelete,
  onCreate,
  onUpdate,
  onDelete,
}: {
  category: Category;
  subcategories: Subcategory[];
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onCreate: (category: Category, draft: SubcategoryDraft) => Promise<void>;
  onUpdate: (subcategory: Subcategory, patch: Partial<SubcategoryDraft>) => Promise<void>;
  onDelete: (subcategory: Subcategory) => void;
}) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [newName, setNewName] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    setDrafts(Object.fromEntries(subcategories.map((subcategory) => [subcategory.id, subcategory.name])));
  }, [subcategories]);

  const saveName = async (subcategory: Subcategory) => {
    const name = (drafts[subcategory.id] ?? "").trim();
    if (!name) {
      setDrafts((prev) => ({ ...prev, [subcategory.id]: subcategory.name }));
      notifications.show({ color: "red", title: "Nombre requerido", message: "La subcategoria necesita un nombre." });
      return;
    }
    if (name === subcategory.name) return;

    setSavingId(subcategory.id);
    try {
      await onUpdate(subcategory, { name });
      notifications.show({ color: "blue", title: "Subcategoria actualizada", message: "Cambios guardados." });
    } finally {
      setSavingId(null);
    }
  };

  const saveActive = async (subcategory: Subcategory, active: boolean) => {
    setSavingId(subcategory.id);
    try {
      await onUpdate(subcategory, { active });
    } finally {
      setSavingId(null);
    }
  };

  const saveNew = async () => {
    const name = newName.trim();
    if (!name) return;

    setSavingId("new");
    try {
      await onCreate(category, { name, active: true });
      setNewName("");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <Accordion variant="contained">
      <Accordion.Item value={category.id}>
        <Accordion.Control>
          <Group justify="space-between" pr="sm">
            <Text size="sm" fw={500}>
              Subcategorias
            </Text>
            <Text size="sm" c="dimmed">
              {subcategories.length}
            </Text>
          </Group>
        </Accordion.Control>
        <Accordion.Panel>
          <Stack gap="xs">
            {canCreate && (
              <Group gap="sm" align="center" wrap="nowrap">
                <TextInput
                  aria-label="Nueva subcategoria"
                  placeholder="Nueva subcategoria"
                  value={newName}
                  onChange={(event) => {
                    const name = event.currentTarget.value;
                    setNewName(name);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      void saveNew();
                    }
                  }}
                  disabled={savingId === "new"}
                  style={{ flex: "1 1 auto", minWidth: 0 }}
                  styles={{
                    input: {
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    },
                  }}
                />
                <ActionIcon
                  variant="filled"
                  color="blue"
                  aria-label="Agregar subcategoria"
                  disabled={!newName.trim() || savingId === "new"}
                  onClick={() => {
                    void saveNew();
                  }}
                >
                  <IconPlus size={16} />
                </ActionIcon>
              </Group>
            )}

            {subcategories.map((subcategory) => (
              <Group key={subcategory.id} gap="sm" align="center" wrap="nowrap">
                <TextInput
                  aria-label={`Editar ${subcategory.name}`}
                  value={drafts[subcategory.id] ?? subcategory.name}
                  onChange={(event) => {
                    const name = event.currentTarget.value;
                    setDrafts((prev) => ({ ...prev, [subcategory.id]: name }));
                  }}
                  onBlur={() => {
                    void saveName(subcategory);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.currentTarget.blur();
                    }
                  }}
                  disabled={!canEdit || savingId === subcategory.id}
                  style={{ flex: "1 1 auto", minWidth: 0 }}
                  styles={{
                    input: {
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    },
                  }}
                />
                <Switch
                  aria-label={`Cambiar estado de ${subcategory.name}`}
                  checked={subcategory.active}
                  disabled={!canEdit || savingId === subcategory.id}
                  onChange={(event) => {
                    const active = event.currentTarget.checked;
                    void saveActive(subcategory, active);
                  }}
                />
                <ActionIcon
                  variant="subtle"
                  color="red"
                  aria-label={`Eliminar ${subcategory.name}`}
                  disabled={!canDelete || savingId === subcategory.id}
                  onClick={() => onDelete(subcategory)}
                >
                  <IconX size={16} />
                </ActionIcon>
              </Group>
            ))}

            {!subcategories.length && (
              <Text size="sm" c="dimmed">
                Sin subcategorias.
              </Text>
            )}

          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}

function CategoryForm({
  initialValues,
  onSubmit,
}: {
  initialValues: CategoryFormValues;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
}) {
  const [values, setValues] = useState(initialValues);
  const [submitting, setSubmitting] = useState(false);

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        setSubmitting(true);
        try {
          await onSubmit(values);
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <Stack gap="md">
        <TextInput
          label="Nombre"
          withAsterisk
          value={values.name}
          onChange={(event) => {
            const name = event.currentTarget.value;
            setValues((prev) => ({ ...prev, name }));
          }}
        />
        <NumberInput
          label="Orden"
          value={values.order}
          onChange={(value) => setValues((prev) => ({ ...prev, order: Number(value ?? 0) }))}
        />
        <Switch
          label="Activo"
          checked={values.active}
          onChange={(event) => {
            const active = event.currentTarget.checked;
            setValues((prev) => ({ ...prev, active }));
          }}
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={() => modals.closeAll()}>
            Cancelar
          </Button>
          <Button type="submit" loading={submitting}>
            Guardar
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
