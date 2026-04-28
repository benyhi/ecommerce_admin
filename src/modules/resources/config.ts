import { ResourceName, Role } from "@/context/AuthContext";

export type FieldType = "text" | "textarea" | "number" | "select" | "switch" | "image";

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

const orderStatusOptions = [
  { value: "pending", label: "Pendiente" },
  { value: "confirmed", label: "Confirmado" },
  { value: "processing", label: "En proceso" },
  { value: "shipped", label: "Enviado" },
  { value: "delivered", label: "Entregado" },
  { value: "cancelled", label: "Cancelado" },
];

const paymentMethodOptions = [
  { value: "cash", label: "Efectivo" },
  { value: "transfer", label: "Transferencia" },
  { value: "card", label: "Tarjeta" },
  { value: "mercadopago", label: "MercadoPago" },
];

const paymentStatusOptions = [
  { value: "pending", label: "Pendiente" },
  { value: "paid", label: "Pagado" },
  { value: "failed", label: "Fallido" },
  { value: "refunded", label: "Reembolsado" },
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
      { key: "active", label: "Activo", type: "switch" },
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
      { key: "customer_name", label: "Nombre del cliente", type: "text", required: true },
      { key: "customer_email", label: "Email del cliente", type: "text" },
      { key: "customer_phone", label: "Teléfono", type: "text" },
      { key: "status", label: "Estado", type: "select", options: orderStatusOptions },
      { key: "payment_method", label: "Método de pago", type: "select", options: paymentMethodOptions },
      { key: "payment_status", label: "Estado de pago", type: "select", options: paymentStatusOptions },
      { key: "discount", label: "Descuento", type: "number" },
      { key: "notes", label: "Notas", type: "textarea" },
    ],
    tableColumns: [
      { key: "order_number", label: "Pedido" },
      { key: "customer_name", label: "Cliente" },
      { key: "total", label: "Total" },
      { key: "status", label: "Estado" },
      { key: "payment_status", label: "Pago" },
      { key: "created_at", label: "Fecha" },
    ],
    filterOptions: { status: orderStatusOptions },
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
  "sitio-publicaciones": {
    name: "Publicaciones",
    resource: "sitio-publicaciones",
    description: "Artículos y noticias del sitio.",
    fields: [
      { key: "title", label: "Título", type: "text", required: true },
      { key: "excerpt", label: "Resumen", type: "textarea" },
      { key: "content", label: "Contenido", type: "textarea" },
      { key: "image_url", label: "Imagen", type: "image" },
      { key: "published_at", label: "Fecha de publicación", type: "text", placeholder: "2025-01-15T10:00:00Z" },
      { key: "order", label: "Orden", type: "number" },
      { key: "active", label: "Activo", type: "switch" },
    ],
    tableColumns: [
      { key: "title", label: "Título" },
      { key: "excerpt", label: "Resumen" },
      { key: "published_at", label: "Publicado" },
      { key: "active", label: "Estado" },
    ],
  },
  "sitio-carrusel": {
    name: "Carrusel",
    resource: "sitio-carrusel",
    description: "Banners del carrusel de la página de inicio.",
    fields: [
      { key: "title", label: "Título", type: "text", required: true },
      { key: "subtitle", label: "Subtítulo", type: "text" },
      { key: "description", label: "Descripción", type: "textarea" },
      { key: "image_url", label: "Imagen", type: "image", required: true },
      { key: "link_url", label: "URL de enlace", type: "text", placeholder: "https://... o /catalogo" },
      { key: "button_text", label: "Texto del botón", type: "text", placeholder: "Ver más" },
      { key: "order", label: "Orden", type: "number" },
      { key: "active", label: "Activo", type: "switch" },
    ],
    tableColumns: [
      { key: "title", label: "Título" },
      { key: "subtitle", label: "Subtítulo" },
      { key: "order", label: "Orden" },
      { key: "active", label: "Estado" },
    ],
  },
  "sitio-destacados": {
    name: "Destacados",
    resource: "sitio-destacados",
    description: "Productos destacados en la página de inicio.",
    fields: [],
    tableColumns: [],
  },
  sitio: {
    name: "Sitio Web",
    resource: "sitio",
    description: "Configuración del sitio web.",
    fields: [],
    tableColumns: [],
  },
  cupones: {
    name: "Cupón",
    resource: "cupones",
    description: "Cupones y descuentos para pedidos.",
    fields: [
      { key: "code", label: "Código", type: "text", required: true, placeholder: "Ej: VERANO20" },
      { key: "description", label: "Descripción", type: "text", placeholder: "Ej: Descuento de verano" },
      {
        key: "discount_type",
        label: "Tipo de descuento",
        type: "select",
        required: true,
        options: [
          { value: "percentage", label: "Porcentaje (%)" },
          { value: "fixed", label: "Monto fijo ($)" },
        ],
      },
      { key: "value", label: "Valor", type: "number", required: true },
      { key: "min_order_amount", label: "Monto mínimo de pedido", type: "number" },
      { key: "max_uses", label: "Usos máximos (vacío = ilimitado)", type: "number" },
      { key: "expires_at", label: "Expira el (ISO 8601)", type: "text", placeholder: "2026-12-31T23:59:00Z" },
      { key: "is_active", label: "Activo", type: "switch" },
    ],
    tableColumns: [
      { key: "code", label: "Código" },
      { key: "discount_type_display", label: "Tipo" },
      { key: "value", label: "Valor" },
      { key: "used_count", label: "Usos" },
      { key: "max_uses", label: "Máx. usos" },
      { key: "is_active", label: "Estado" },
      { key: "expires_at", label: "Vence" },
    ],
    filterOptions: {
      status: [
        { value: "true", label: "Activos" },
        { value: "false", label: "Inactivos" },
      ],
    },
  },
};
