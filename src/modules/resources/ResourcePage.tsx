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
import React, { useMemo, useState } from "react";

import { ResourceName, useAuth } from "@/context/AuthContext";
import { useCrudResource } from "@/hooks/useCrudResource";
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
  } = useCrudResource<ResourceItem>(resource, { pageSize: 8, defaultFilters: { status: null } });

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
    () => config.filterOptions?.status ?? [],
    [config.filterOptions?.status]
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
              value={filters.status ?? null}
              clearable
              onChange={(value) => setFilter("status", value)}
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
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: ResourceField) => {
    const commonProps = {
      key: field.key,
      label: field.label,
      placeholder: field.placeholder,
      withAsterisk: field.required,
      error: errors[field.key],
    } as const;

    if (field.type === "select") {
      return (
        <Select
          {...commonProps}
          data={field.options ?? []}
          value={(values[field.key] as string | null) ?? null}
          onChange={(value) => updateField(field, value)}
          clearable
        />
      );
    }

    if (field.type === "number") {
      return (
        <NumberInput
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
          {...commonProps}
          value={(values[field.key] as string) ?? ""}
          onChange={(event) => updateField(field, event.currentTarget.value)}
          autosize
          minRows={3}
        />
      );
    }

    return (
      <TextInput
        {...commonProps}
        value={(values[field.key] as string) ?? ""}
        onChange={(event) => updateField(field, event.currentTarget.value)}
      />
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
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
