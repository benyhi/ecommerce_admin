"use client";

import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  LoadingOverlay,
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
} from "@mantine/core";
import { IconEdit, IconPlus, IconSearch, IconTrash } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import React, { useEffect, useMemo, useState } from "react";

import { ResourceName, useAuth } from "@/context/AuthContext";
import { useCrudResource } from "@/hooks/useCrudResource";
import { ImagePickerField } from "@/components/common/ImagePickerModal";
import { categoriesAdmin } from "@/lib/api/services/admin.service";
import { ApiError } from "@/lib/api/types";
import {
  ResourceConfig,
  ResourceField,
  resourceConfigs,
} from "./config";

type ResourceItem = Record<string, unknown> & { id: string; name?: string; status?: string };

const statusColor = (status?: string) => {
  switch (status) {
    case "active":
      return "green";
    case "pending":
      return "yellow";
    case "draft":
      return "gray";
    case "cancelled":
      return "red";
    default:
      return "gray";
  }
};

/** Resolve dot-notation keys like "category.name" from a row object */
const resolveValue = (row: Record<string, unknown>, key: string): unknown => {
  return key.split(".").reduce<unknown>((obj, part) => {
    if (obj && typeof obj === "object") return (obj as Record<string, unknown>)[part];
    return undefined;
  }, row);
};

const formatValue = (key: string, value: unknown) => {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Activo" : "Inactivo";
  if (key === "price" || key === "total") {
    const numberValue = Number(value);
    if (Number.isNaN(numberValue)) return `${value}`;
    return numberValue.toLocaleString("es-CL", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    });
  }
  if (key.toLowerCase().includes("date") || key.endsWith("At")) {
    return new Date(String(value)).toLocaleString("es-CL");
  }
  return `${value}`;
};

type ResourcePageProps = {
  resource: ResourceName;
};

export function ResourcePage({ resource }: ResourcePageProps) {
  const config = resourceConfigs[resource];
  const { can } = useAuth();
  const filterKey = config.filterOptions ? Object.keys(config.filterOptions)[0] : "status";
  const {
    rows,
    total,
    page,
    pageSize,
    loading,
    error,
    search,
    filters,
    setSearch,
    setPage,
    setPageSize,
    setFilter,
    createItem,
    updateItem,
    deleteItem,
  } = useCrudResource<ResourceItem>(resource, { pageSize: 8, defaultFilters: { [filterKey]: null } });

  const handleDelete = (item: ResourceItem) => {
    modals.openConfirmModal({
      title: `Eliminar ${config.name}`,
      centered: true,
      labels: { confirm: "Eliminar", cancel: "Cancelar" },
      confirmProps: { color: "red" },
      children: (
        <Text size="sm">
          ¿Seguro que deseas eliminar <b>{item.name}</b>? Esta acción no se puede
          deshacer.
        </Text>
      ),
      onConfirm: async () => {
        await deleteItem(item.id);
        notifications.show({
          color: "green",
          title: `${config.name} eliminada`,
          message: "Se eliminó correctamente.",
        });
      },
    });
  };

  const openForm = (mode: "create" | "edit", item?: ResourceItem) => {
    const initialValues = config.fields.reduce<Record<string, unknown>>(
      (acc, field) => {
        if (field.type === "switch") {
          const val = item ? (item as Record<string, unknown>)[field.key] : true;
          return { ...acc, [field.key]: val === undefined ? true : Boolean(val) };
        }
        return {
          ...acc,
          [field.key]: item ? (item as Record<string, unknown>)[field.key] ?? "" : "",
        };
      },
      { status: item?.status ?? "active", name: item?.name ?? "" }
    );

    modals.open({
      title: mode === "create" ? `Crear ${config.name}` : `Editar ${config.name}`,
      size: "lg",
      children: (
        <ResourceForm
          mode={mode}
          config={config}
          initialValues={initialValues}
          onSubmit={async (values) => {
            if (mode === "create") {
              await createItem(values);
              notifications.show({
                color: "green",
                title: `${config.name} creada`,
                message: "Guardado correctamente.",
              });
            } else if (item) {
              await updateItem(item.id, values);
              notifications.show({
                color: "blue",
                title: `${config.name} actualizada`,
                message: "Cambios guardados.",
              });
            }
            modals.closeAll();
          }}
        />
      ),
    });
  };

  const statusFilterOptions = useMemo(
    () => (config.filterOptions ? Object.values(config.filterOptions)[0] : []) ?? [],
    [config.filterOptions]
  );

  const canCreate = can("create", resource);
  const canEdit = can("update", resource);
  const canDelete = can("delete", resource);

  return (
    <Box pos="relative">
      <LoadingOverlay visible={loading} zIndex={10} />
      {error && (
        <Text c="red" size="sm" mb="md" fw={500}>
          Error: {error}
        </Text>
      )}
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={2}>{config.name}</Title>
            <Text c="dimmed" size="sm">
              {config.description}
            </Text>
          </div>
          <Group>
            <Select
              w={180}
              placeholder="Estado"
              data={statusFilterOptions}
              value={(filters[filterKey] ?? null) as string | null}
              clearable
              onChange={(value) => setFilter(filterKey, value)}
            />
            {canCreate && (
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => openForm("create")}
              >
                Nuevo
              </Button>
            )}
          </Group>
        </Group>

        <Group>
          <TextInput
            leftSection={<IconSearch size={16} />}
            placeholder="Buscar..."
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            w={320}
          />
        </Group>

        <Box>
          <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                {config.tableColumns.map((column) => (
                  <Table.Th key={column.key}>{column.label}</Table.Th>
                ))}
                <Table.Th w={120}>Acciones</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((row) => (
                <Table.Tr key={row.id}>
                  {config.tableColumns.map((column) => {
                    const value = resolveValue(row as Record<string, unknown>, column.key);
                    if (column.key === "status" || column.key === "active") {
                      const isActive =
                        typeof value === "boolean" ? value : String(value) === "active";
                      return (
                        <Table.Td key={column.key}>
                          <Badge color={isActive ? "green" : "red"} variant="light">
                            {typeof value === "boolean" ? (value ? "Activo" : "Inactivo") : formatValue(column.key, value)}
                          </Badge>
                        </Table.Td>
                      );
                    }
                    return (
                      <Table.Td key={column.key}>
                        {formatValue(column.key, value)}
                      </Table.Td>
                    );
                  })}
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        aria-label="Editar"
                        onClick={() => openForm("edit", row)}
                        disabled={!canEdit}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        aria-label="Eliminar"
                        onClick={() => handleDelete(row)}
                        disabled={!canDelete}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
              {!rows.length && !loading && (
                <Table.Tr>
                  <Table.Td colSpan={config.tableColumns.length + 1}>
                    <Text c="dimmed" size="sm">
                      Sin registros aún.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Box>

        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            {`Mostrando ${rows.length} de ${total}`}
          </Text>
          <Group>
            <Select
              w={120}
              data={["5", "8", "10", "20"]}
              value={String(pageSize)}
              onChange={(value) => setPageSize(Number(value ?? pageSize))}
            />
            <Pagination
              total={Math.max(1, Math.ceil(total / pageSize))}
              value={page}
              onChange={setPage}
              size="sm"
            />
          </Group>
        </Group>
      </Stack>
    </Box>
  );
}

type ResourceFormProps = {
  mode: "create" | "edit";
  config: ResourceConfig;
  initialValues: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
};

const ResourceForm: React.FC<ResourceFormProps> = ({
  mode,
  config,
  initialValues,
  onSubmit,
}) => {
  const [values, setValues] = useState<Record<string, unknown>>(initialValues);
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, { value: string; label: string }[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const needsCategories = config.fields.some((field) => field.optionSource === "categorias");
    if (!needsCategories) return;

    let mounted = true;
    categoriesAdmin
      .list()
      .then((result) => {
        const rows = Array.isArray(result) ? result : result.results ?? [];
        const options = rows.map((row) => ({
          value: String(row.id),
          label: String(row.name ?? row.id),
        }));
        if (mounted) {
          setDynamicOptions((prev) => ({ ...prev, categorias: options }));
        }
      })
      .catch(() => {
        if (mounted) {
          setDynamicOptions((prev) => ({ ...prev, categorias: [] }));
        }
      });

    return () => {
      mounted = false;
    };
  }, [config.fields]);

  const updateField = (field: ResourceField, value: unknown) => {
    setValues((prev) => ({ ...prev, [field.key]: value }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    config.fields.forEach((field) => {
      if (field.required && !values[field.key]) {
        nextErrors[field.key] = "Requerido";
      }
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      if (error instanceof ApiError) {
        const fieldErrors = Object.fromEntries(
          Object.entries(error.fieldErrors).map(([key, messages]) => [key, messages.join(" ")]),
        );
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
        setFormError(
          error.message !== `Request failed with status ${error.status}`
            ? error.message
            : "No se pudo guardar. Revisá los campos marcados.",
        );
        return;
      }
      setFormError("No se pudo guardar. Intentá nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: ResourceField) => {
    const commonProps = {
      label: field.label,
      placeholder: field.placeholder,
      withAsterisk: field.required,
      error: errors[field.key],
    } as const;

    if (field.type === "select") {
      const options = field.optionSource
        ? dynamicOptions[field.optionSource] ?? []
        : field.options ?? [];

      return (
        <Select
          key={field.key}
          {...commonProps}
          data={options}
          value={(values[field.key] as string | null) ?? null}
          onChange={(value) => updateField(field, value)}
          clearable
        />
      );
    }

    if (field.type === "number") {
      return (
        <NumberInput
          key={field.key}
          {...commonProps}
          value={Number(values[field.key]) || 0}
          onChange={(value) => updateField(field, value ?? 0)}
          thousandSeparator="."
          decimalSeparator="," 
        />
      );
    }

    if (field.type === "switch") {
      return (
        <Switch
          key={field.key}
          label={field.label}
          checked={Boolean(values[field.key])}
          onChange={(e) => updateField(field, e.currentTarget.checked)}
        />
      );
    }

    if (field.type === "textarea") {
      return (
        <Textarea
          key={field.key}
          {...commonProps}
          value={(values[field.key] as string) ?? ""}
          onChange={(event) => updateField(field, event.currentTarget.value)}
          autosize
          minRows={3}
        />
      );
    }

    if (field.type === "image") {
      return (
        <ImagePickerField
          key={field.key}
          label={field.label}
          value={(values[field.key] as string) ?? ""}
          onChange={(url) => updateField(field, url)}
          required={field.required}
          error={errors[field.key]}
        />
      );
    }

    return (
      <TextInput
        key={field.key}
        {...commonProps}
        value={(values[field.key] as string) ?? ""}
        onChange={(event) => updateField(field, event.currentTarget.value)}
      />
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        {formError && (
          <Text c="red" size="sm" fw={600}>
            {formError}
          </Text>
        )}
        {config.fields.map((field) => renderField(field))}
        <Group justify="flex-end">
          <Button variant="default" onClick={() => modals.closeAll()}>
            Cancelar
          </Button>
          <Button type="submit" loading={submitting}>
            {mode === "create" ? "Crear" : "Guardar"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
