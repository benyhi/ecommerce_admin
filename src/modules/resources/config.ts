import { ResourceName, Role } from "@/context/AuthContext";

export type FieldType = "text" | "number" | "select";

export type ResourceField = {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
};

export type TableColumn = {
  key: string;
  label: string;
};

export type ResourceConfig = {
  name: string;
  resource: ResourceName;
  description: string;
  fields: ResourceField[];
  tableColumns: TableColumn[];
  filterOptions?: { status?: { value: string; label: string }[] };
};

const statusOptions = [
  { value: "active", label: "Activo" },
  { value: "pending", label: "Pendiente" },
  { value: "draft", label: "Borrador" },
  { value: "cancelled", label: "Cancelado" },
];

const roleOptions: { value: Role; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "employee", label: "Empleado" },
  { value: "editor", label: "Editor" },
  { value: "read", label: "Solo lectura" },
];

export const resourceConfigs: Record<ResourceName, ResourceConfig> = {
  metricas: {
    name: "Metricas",
    resource: "metricas",
    description: "KPIs y resultados clave con tracking por equipo.",
    fields: [
      { key: "name", label: "Nombre", type: "text", required: true },
      { key: "owner", label: "Área responsable", type: "text" },
      { key: "status", label: "Estado", type: "select", options: statusOptions },
      { key: "value", label: "Valor", type: "text", placeholder: "Ej: 3.5%" },
    ],
    tableColumns: [
      { key: "name", label: "Nombre" },
      { key: "owner", label: "Owner" },
      { key: "status", label: "Estado" },
      { key: "value", label: "Valor" },
      { key: "updatedAt", label: "Actualizado" },
    ],
    filterOptions: { status: statusOptions },
  },
  categorias: {
    name: "Categorias",
    resource: "categorias",
    description: "Organiza los productos por categorías.",
    fields: [
      { key: "name", label: "Nombre", type: "text", required: true },
      { key: "order", label: "Orden", type: "number" },
    ],
    tableColumns: [
      { key: "name", label: "Nombre" },
      { key: "order", label: "Orden" },
      { key: "active", label: "Estado" },
    ],
  },
  productos: {
    name: "Productos",
    resource: "productos",
    description: "Catálogo de productos con precios y opciones.",
    fields: [
      { key: "name", label: "Nombre", type: "text", required: true },
      { key: "description", label: "Descripción", type: "text" },
      { key: "price", label: "Precio", type: "number", required: true },
      { key: "order", label: "Orden", type: "number" },
    ],
    tableColumns: [
      { key: "name", label: "Producto" },
      { key: "category.name", label: "Categoría" },
      { key: "price", label: "Precio" },
      { key: "active", label: "Estado" },
      { key: "order", label: "Orden" },
    ],
  },
  pedidos: {
    name: "Pedidos",
    resource: "pedidos",
    description: "Pedidos recientes con totales y estado.",
    fields: [
      { key: "orderNumber", label: "Número de pedido", type: "text", required: true },
      { key: "customer", label: "Cliente", type: "text", required: true },
      { key: "total", label: "Total", type: "number", required: true },
      { key: "status", label: "Estado", type: "select", options: statusOptions },
    ],
    tableColumns: [
      { key: "orderNumber", label: "Pedido" },
      { key: "customer", label: "Cliente" },
      { key: "total", label: "Total" },
      { key: "status", label: "Estado" },
      { key: "updatedAt", label: "Actualizado" },
    ],
    filterOptions: { status: statusOptions },
  },
  usuarios: {
    name: "Usuarios",
    resource: "usuarios",
    description: "Usuarios internos y roles del panel.",
    fields: [
      { key: "name", label: "Nombre", type: "text", required: true },
      { key: "email", label: "Email", type: "text", required: true },
      { key: "role", label: "Rol", type: "select", options: roleOptions },
      { key: "status", label: "Estado", type: "select", options: statusOptions },
    ],
    tableColumns: [
      { key: "name", label: "Nombre" },
      { key: "email", label: "Email" },
      { key: "role", label: "Rol" },
      { key: "status", label: "Estado" },
      { key: "updatedAt", label: "Actualizado" },
    ],
    filterOptions: { status: statusOptions },
  },
  clientes: {
    name: "Clientes",
    resource: "clientes",
    description: "Clientes con segmento y estado.",
    fields: [
      { key: "name", label: "Nombre", type: "text", required: true },
      { key: "email", label: "Email", type: "text" },
      { key: "segment", label: "Segmento", type: "text", placeholder: "B2B / B2C" },
      { key: "status", label: "Estado", type: "select", options: statusOptions },
    ],
    tableColumns: [
      { key: "name", label: "Nombre" },
      { key: "email", label: "Email" },
      { key: "segment", label: "Segmento" },
      { key: "status", label: "Estado" },
      { key: "updatedAt", label: "Actualizado" },
    ],
    filterOptions: { status: statusOptions },
  },
  configuracion: {
    name: "Configuración",
    resource: "configuracion",
    description: "Parámetros clave del tenant (ej. impuestos, moneda).",
    fields: [
      { key: "name", label: "Nombre", type: "text", required: true },
      { key: "key", label: "Clave", type: "text", required: true },
      { key: "value", label: "Valor", type: "text", required: true },
      { key: "status", label: "Estado", type: "select", options: statusOptions },
    ],
    tableColumns: [
      { key: "name", label: "Nombre" },
      { key: "key", label: "Clave" },
      { key: "value", label: "Valor" },
      { key: "status", label: "Estado" },
      { key: "updatedAt", label: "Actualizado" },
    ],
    filterOptions: { status: statusOptions },
  },
  pos: {
    name: "Punto de Venta",
    resource: "pos",
    description: "Módulo de punto de venta — no usa la tabla CRUD.",
    fields: [],
    tableColumns: [],
  },
};
