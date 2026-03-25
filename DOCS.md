# Documentación del Proyecto — eCommerce Admin Panel

> Panel de administración Next.js para un backend Django multi-tenant con autenticación JWT, catálogo de productos, gestión CRUD genérica y punto de venta integrado.

---

## Tabla de Contenidos

1. [Stack Tecnológico](#1-stack-tecnológico)
2. [Estructura del Proyecto](#2-estructura-del-proyecto)
3. [Arquitectura General](#3-arquitectura-general)
4. [Capa de API (`src/lib/api/`)](#4-capa-de-api)
   - 4.1 [Tipos (`types.ts`)](#41-tipos)
   - 4.2 [Token Manager (`tokenManager.ts`)](#42-token-manager)
   - 4.3 [HTTP Client (`httpClient.ts`)](#43-http-client)
   - 4.4 [Servicios](#44-servicios)
5. [Autenticación y Autorización](#5-autenticación-y-autorización)
   - 5.1 [AuthContext](#51-authcontext)
   - 5.2 [Flujo de Login](#52-flujo-de-login)
   - 5.3 [Roles y Permisos](#53-roles-y-permisos)
6. [Sistema CRUD Genérico](#6-sistema-crud-genérico)
   - 6.1 [useCrudResource (Hook)](#61-usecrudresource)
   - 6.2 [ResourcePage (Componente)](#62-resourcepage)
   - 6.3 [Configuración de Recursos (`config.ts`)](#63-configuración-de-recursos)
7. [Módulo POS (Punto de Venta)](#7-módulo-pos)
8. [Routing y Layouts](#8-routing-y-layouts)
9. [Proveedores (`AppProviders`)](#9-proveedores)
10. [Variables de Entorno](#10-variables-de-entorno)
11. [Scripts Disponibles](#11-scripts-disponibles)
12. [Guía para Agregar un Nuevo Recurso](#12-guía-para-agregar-un-nuevo-recurso)

---

## 1. Stack Tecnológico

| Capa             | Tecnología                                      |
| ---------------- | ----------------------------------------------- |
| **Framework**    | Next.js 16.0.10 (App Router)                    |
| **UI**           | Mantine v8.3.16 (core, dates, hooks, modals, notifications) |
| **Lenguaje**     | TypeScript 5.x + React 19.2                     |
| **Iconos**       | @tabler/icons-react                             |
| **Gráficos**     | ApexCharts (react-apexcharts)                   |
| **Calendario**   | FullCalendar v6                                 |
| **Fechas**       | dayjs                                           |
| **Estado**       | React Context (sin Redux/Zustand)               |
| **Backend**      | Django 6.0 + Django REST Framework + SimpleJWT   |
| **Multi-tenant** | Header `X-Tenant` con slug del tenant           |
| **Almacenamiento** | S3 / Cloudflare R2 para imágenes              |

---

## 2. Estructura del Proyecto

```
src/
├── app/                          # Rutas del App Router de Next.js
│   ├── globals.css               # Estilos globales
│   ├── layout.tsx                # Layout raíz (proveedores)
│   ├── not-found.tsx             # Página 404 global
│   ├── (admin)/                  # Grupo: rutas protegidas del admin
│   │   ├── layout.tsx            # Shell del admin (header + sidebar)
│   │   ├── page.tsx              # Dashboard principal
│   │   ├── categorias/page.tsx
│   │   ├── productos/page.tsx
│   │   ├── pedidos/page.tsx
│   │   ├── usuarios/page.tsx
│   │   ├── clientes/page.tsx
│   │   ├── configuracion/page.tsx
│   │   ├── metricas/page.tsx
│   │   ├── pos/page.tsx
│   │   └── calendar/page.tsx
│   └── (full-width-pages)/       # Grupo: páginas sin sidebar
│       ├── (auth)/               # Login y registro
│       │   ├── signin/page.tsx
│       │   └── signup/page.tsx
│       └── (error-pages)/
│           └── error-404/page.tsx
│
├── components/                   # Componentes reutilizables
│   ├── auth/                     # SignInForm, SignUpForm, ProtectedView
│   ├── calendar/                 # Componente de calendario
│   ├── common/                   # PageBreadCrumb
│   ├── ecommerce/                # Métricas del dashboard
│   └── header/                   # NotificationDropdown, UserDropdown
│
├── context/                      # Contextos de React
│   ├── AuthContext.tsx            # Autenticación + permisos por rol
│   └── SidebarContext.tsx         # Estado del sidebar (open/close)
│
├── hooks/                        # Custom hooks
│   └── useCrudResource.ts        # Hook genérico CRUD
│
├── layout/                       # Componentes de layout
│   ├── AppHeader.tsx             # Header con notificaciones y usuario
│   └── AppSidebar.tsx            # Sidebar de navegación
│
├── lib/api/                      # Capa de comunicación con el backend
│   ├── types.ts                  # DTOs y tipos de la API
│   ├── tokenManager.ts           # Gestión de JWT en localStorage
│   ├── httpClient.ts             # Cliente HTTP con interceptor de auth
│   └── services/
│       ├── auth.service.ts       # Login, refresh, me, logout
│       ├── catalog.service.ts    # Catálogo público (productos, categorías)
│       ├── admin.service.ts      # Factory CRUD genérico + instancias
│       └── index.ts              # Barrel exports
│
├── modules/                      # Módulos de funcionalidad
│   ├── resources/
│   │   ├── config.ts             # Configuración de cada recurso CRUD
│   │   └── ResourcePage.tsx      # Tabla CRUD genérica con modales
│   ├── metricas/
│   │   └── MetricasContent.tsx
│   └── pos/                      # Punto de venta
│       ├── PosContent.tsx        # Layout principal del POS
│       ├── types.ts              # Tipos del POS
│       ├── usePosCart.ts         # Estado del carrito
│       ├── usePosProductSearch.ts # Búsqueda de productos
│       ├── components/           # UI del POS
│       │   ├── ProductSearch.tsx
│       │   ├── CartTable.tsx
│       │   ├── CartSummary.tsx
│       │   ├── PaymentMethodSelector.tsx
│       │   ├── CashPayment.tsx
│       │   ├── TransferPayment.tsx
│       │   ├── CardPayment.tsx
│       │   ├── TicketPreview.tsx
│       │   └── VariantSelector.tsx
│       └── payments/             # Interfaz de proveedores de pago
│           ├── types.ts          # PaymentProvider (interfaz)
│           └── mercadopago.ts    # Implementación mock de MercadoPago
│
└── providers/
    └── AppProviders.tsx          # Mantine + Auth + Sidebar providers
```

---

## 3. Arquitectura General

```
┌──────────────────────────────────────────────────────────┐
│                      Next.js App Router                  │
│  ┌───────────────┐   ┌──────────────┐   ┌────────────┐  │
│  │  (admin)/*    │   │  (auth)/*    │   │  POS       │  │
│  │  ResourcePage │   │  SignInForm  │   │  PosContent│  │
│  └──────┬────────┘   └──────┬───────┘   └─────┬──────┘  │
│         │                   │                  │         │
│  ┌──────▼────────┐   ┌──────▼───────┐   ┌─────▼──────┐  │
│  │useCrudResource│   │  AuthContext  │   │usePosCart   │  │
│  └──────┬────────┘   └──────┬───────┘   └─────┬──────┘  │
│         │                   │                  │         │
│  ═══════╪═══════════════════╪══════════════════╪═══════  │
│                     Capa de Servicios                    │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐  │
│  │ adminService  │ │ authService   │ │catalogService │  │
│  └──────┬────────┘ └──────┬────────┘ └──────┬────────┘  │
│         └─────────────────┼─────────────────┘            │
│                    ┌──────▼────────┐                     │
│                    │  httpClient   │                     │
│                    │  + tokenMgr   │                     │
│                    └──────┬────────┘                     │
└───────────────────────────┼──────────────────────────────┘
                            │  fetch + JWT + X-Tenant
                            ▼
                   ┌─────────────────┐
                   │  Django Backend  │
                   │  (DRF + JWT)    │
                   └─────────────────┘
```

**Flujo de datos:**

1. Cada **página** del App Router renderiza un **módulo** (ResourcePage, PosContent, etc.)
2. Los módulos usan **hooks** (`useCrudResource`, `usePosCart`) para gestionar estado y datos.
3. Los hooks llaman a los **servicios** (`adminService`, `catalogService`, `authService`).
4. Los servicios usan el **httpClient** que maneja automáticamente: tokens JWT, header `X-Tenant`, refresh silencioso ante 401, y parsing de errores DRF.

---

## 4. Capa de API

Toda la comunicación con el backend vive en `src/lib/api/`. Es completamente modular: se pueden agregar nuevos servicios sin tocar el httpClient.

### 4.1 Tipos

**Archivo:** `src/lib/api/types.ts`

Define todos los DTOs que mapean 1:1 con los serializers de Django:

| Tipo               | Descripción                                        |
| ------------------ | -------------------------------------------------- |
| `LoginRequest`     | `{ email, password, tenant }`                       |
| `LoginResponse`    | `{ access, refresh, user }`                         |
| `UserInfo`         | `{ id, email, first_name, last_name, role, tenant }` |
| `Tenant`           | `{ id, name, slug }`                                |
| `Category`         | `{ id, name, order, active, image, products[] }`    |
| `CategorySummary`  | `{ id, name }`                                      |
| `Product`          | Producto completo con `category`, `option_groups[]` |
| `ProductSummary`   | Versión resumida para listados                      |
| `OptionGroup`      | Grupo de opciones con `options[]`                   |
| `Option`           | `{ id, name, price_adjustment }`                    |
| `PaginatedResponse<T>` | `{ count, next, previous, results: T[] }`       |
| `ApiError`         | Clase de error con `status`, `message`, `errors`    |
| `QueryParams`      | Parámetros de consulta (page, search, etc.)         |

### 4.2 Token Manager

**Archivo:** `src/lib/api/tokenManager.ts`

Gestiona el ciclo de vida de los tokens JWT en `localStorage`:

```typescript
tokenManager.setTokens(access, refresh)  // Guarda ambos tokens
tokenManager.getAccessToken()            // Lee el access token
tokenManager.getRefreshToken()           // Lee el refresh token
tokenManager.clearTokens()               // Limpia ambos tokens
tokenManager.getTenant()                 // Lee el slug del tenant
tokenManager.setTenant(slug)             // Guarda el slug del tenant
tokenManager.isTokenExpired(token)       // Verifica expiración (buffer de 30s)
```

**Claves de localStorage:**
- `auth-access-token`
- `auth-refresh-token`
- `auth-tenant-slug`

### 4.3 HTTP Client

**Archivo:** `src/lib/api/httpClient.ts`

Cliente HTTP basado en `fetch` nativo con las siguientes características:

| Característica         | Detalle                                                              |
| ---------------------- | -------------------------------------------------------------------- |
| **Auth automática**    | Adjunta `Bearer <token>` en cada request (excepto si `noAuth: true`) |
| **Multi-tenant**       | Adjunta `X-Tenant: <slug>` si hay tenant guardado                    |
| **Token refresh**      | Si el token está por expirar (buffer 30s), lo refresca antes         |
| **Retry ante 401**     | Si el backend rechaza con 401, intenta refresh y reintenta una vez   |
| **Deduplicación**      | Múltiples requests concurrentes con token expirado comparten un solo refresh |
| **Redirect a login**   | Si el refresh falla, redirige a `/signin`                            |
| **Parsing de errores** | Convierte errores DRF a `ApiError` con `status`, `message`, `errors` |

**Métodos disponibles:**

```typescript
httpClient.get<T>(path, params?, options?)
httpClient.post<T>(path, body?, options?)
httpClient.put<T>(path, body?)
httpClient.patch<T>(path, body?)
httpClient.delete(path)
```

La opción `{ noAuth: true }` omite la cabecera de autorización (usada en endpoints públicos como login y catálogo).

### 4.4 Servicios

#### Auth Service (`auth.service.ts`)

```typescript
authService.login({ email, password, tenant })  // POST /api/auth/login/
authService.refresh()                            // POST /api/auth/refresh/
authService.me()                                 // GET  /api/auth/me/
authService.logout()                             // Limpia tokens locales
```

- `login` guarda automáticamente los tokens y el tenant en localStorage.
- `refresh` actualiza sólo el access token.
- `logout` no llama al backend, sólo limpia el estado local.

#### Catalog Service (`catalog.service.ts`)

Endpoints públicos (no requieren autenticación):

```typescript
catalogService.getCategories(params?)  // GET /api/catalog/categories/
catalogService.getCategory(id)         // GET /api/catalog/categories/:id/
catalogService.getProducts(params?)    // GET /api/catalog/products/
catalogService.getProduct(id)          // GET /api/catalog/products/:id/
```

#### Admin Service (`admin.service.ts`)

**Factory genérica** que crea servicios CRUD para cualquier recurso:

```typescript
const service = createAdminService<MiTipo>("/api/admin/mi-recurso");

service.list(params?)       // GET    /api/admin/mi-recurso/
service.getById(id)         // GET    /api/admin/mi-recurso/:id/
service.create(data)        // POST   /api/admin/mi-recurso/
service.update(id, data)    // PUT    /api/admin/mi-recurso/:id/
service.remove(id)          // DELETE /api/admin/mi-recurso/:id/
```

**Instancias pre-construidas:**

| Instancia         | Base Path                  |
| ----------------- | -------------------------- |
| `categoriesAdmin` | `/api/catalog/categories`  |
| `productsAdmin`   | `/api/catalog/products`    |
| `ordersAdmin`     | `/api/admin/orders`        |
| `usersAdmin`      | `/api/admin/users`         |
| `customersAdmin`  | `/api/admin/customers`     |
| `configAdmin`     | `/api/admin/config`        |
| `metricsAdmin`    | `/api/admin/metrics`       |

> **Nota:** Categorías y productos usan el prefijo `/api/catalog/` (no `/api/admin/`), ya que el backend expone el catálogo bajo ese path.

**Mapeo por nombre de recurso:**

`getAdminService("productos")` devuelve `productsAdmin`. Esto es usado internamente por `useCrudResource` para resolver dinámicamente qué servicio usar según la página actual.

---

## 5. Autenticación y Autorización

### 5.1 AuthContext

**Archivo:** `src/context/AuthContext.tsx`

Provee estado de autenticación global a toda la app mediante React Context.

**Estado expuesto:**

```typescript
{
  user: UserInfo | null;        // Datos del usuario autenticado
  isAuthenticated: boolean;     // true si hay sesión activa
  loading: boolean;             // true mientras rehydrata la sesión
  can: (action, resource) => boolean;  // Verificador de permisos
  login: (email, password, tenant) => Promise<void>;
  logout: () => void;
}
```

**Rehidratación de sesión:** Al montar, si hay un access token en localStorage, intenta llamar a `authService.me()` para restaurar la sesión. Si falla, limpia los tokens.

### 5.2 Flujo de Login

```
Usuario ingresa email + password + tenant
        │
        ▼
  SignInForm.tsx
        │ llama useAuth().login()
        ▼
  AuthContext.login()
        │ llama authService.login()
        ▼
  auth.service.ts
        │ POST /api/auth/login/
        │ guarda tokens en localStorage
        │ guarda tenant slug
        ▼
  AuthContext actualiza estado
        │ user = response.user
        │ isAuthenticated = true
        ▼
  Redirect a "/" (dashboard)
```

### 5.3 Roles y Permisos

El sistema soporta 4 roles que vienen del backend:

| Rol        | Leer | Crear | Editar | Eliminar |
| ---------- | ---- | ----- | ------ | -------- |
| `admin`    | ✅   | ✅    | ✅     | ✅       |
| `employee` | ✅   | ✅    | ✅     | ❌       |
| `editor`   | ✅   | ❌    | ✅     | ❌       |
| `read`     | ✅   | ❌    | ❌     | ❌       |

La función `can(action, resource)` evalúa esto. Se usa en los componentes para mostrar/ocultar botones de acción:

```tsx
const { can } = useAuth();

// En la vista:
{can("create", "productos") && <Button>Nuevo</Button>}
{can("delete", "productos") && <ActionIcon>🗑</ActionIcon>}
```

**ProtectedView** (`src/components/auth/ProtectedView.tsx`): Wrapper que redirige a `/signin` si no hay sesión activa. Se usa en el layout del grupo `(admin)`.

---

## 6. Sistema CRUD Genérico

### 6.1 useCrudResource

**Archivo:** `src/hooks/useCrudResource.ts`

Hook que encapsula toda la lógica de un listado CRUD con paginación, búsqueda y filtros.

**Uso básico:**

```typescript
const {
  rows,           // T[] — registros de la página actual
  total,          // number — total de registros
  page,           // number — página actual
  loading,        // boolean
  search,         // string — término de búsqueda
  setSearch,      // (value: string) => void
  setPage,        // (page: number) => void
  createItem,     // (payload) => Promise<T>
  updateItem,     // (id, payload) => Promise<T>
  deleteItem,     // (id) => Promise<void>
  refresh,        // () => Promise<void> — recarga manual
} = useCrudResource<MiTipo>("productos", { pageSize: 8 });
```

**Características:**
- **Búsqueda debounced** (300ms) para no saturar la API.
- **Paginación DRF**: Interpreta `{ count, results }` del backend.
- **Filtros dinámicos:** Se envían como query params al backend.
- **Auto-refresh** tras crear, editar o eliminar.
- **Null safety:** `results ?? []` para manejar respuestas inesperadas.

### 6.2 ResourcePage

**Archivo:** `src/modules/resources/ResourcePage.tsx`

Componente que renderiza una tabla CRUD completa basándose en la configuración del recurso.

**Incluye:**
- Tabla con columnas configurables.
- Búsqueda por texto.
- Filtro por estado.
- Paginación con selector de tamaño de página (5, 8, 10, 20).
- Botón "Nuevo" (si el usuario tiene permiso de crear).
- Botones de editar/eliminar por fila (controlados por permisos).
- Modal de formulario dinámico para crear/editar.
- Modal de confirmación para eliminar.
- Notificaciones de éxito mediante Mantine.

**Soporte para campos anidados:**  
La función `resolveValue()` permite usar keys con dot-notation como `"category.name"` para acceder a campos anidados del objeto.

**Formateo automático:**
- `price` / `total` → formato moneda (USD, locale es-CL).
- Campos con "date" o que terminan en "At" → formato fecha.
- Booleanos → "Activo" / "Inactivo" con Badge de color.

### 6.3 Configuración de Recursos

**Archivo:** `src/modules/resources/config.ts`

Cada recurso se define con:

```typescript
type ResourceConfig = {
  name: string;           // Nombre para mostrar (ej: "Productos")
  resource: ResourceName; // Key del recurso (ej: "productos")
  description: string;    // Descripción bajo el título
  fields: ResourceField[];     // Campos del formulario
  tableColumns: TableColumn[]; // Columnas de la tabla
  filterOptions?: { status?: Option[] }; // Opciones de filtro
};
```

**Recursos configurados actualmente:**

| Recurso         | Campos del formulario              | Columnas de la tabla                   |
| --------------- | ---------------------------------- | -------------------------------------- |
| `categorias`    | name, order                        | name, order, active                    |
| `productos`     | name, description, price, order    | name, category.name, price, active, order |
| `pedidos`       | orderNumber, customer, total, status | orderNumber, customer, total, status, updatedAt |
| `usuarios`      | name, email, role, status          | name, email, role, status, updatedAt   |
| `clientes`      | name, email, segment, status       | name, email, segment, status, updatedAt |
| `configuracion` | name, key, value, status           | name, key, value, status, updatedAt    |
| `metricas`      | name, owner, status, value         | name, owner, status, value, updatedAt  |
| `pos`           | — (no usa tabla CRUD)              | —                                      |

---

## 7. Módulo POS

El Punto de Venta es un módulo independiente con su propio flujo de estados.

### Flujo de 3 Etapas

```
  ┌──────────┐     startPayment()     ┌──────────┐     confirm()          ┌───────────┐
  │ Browsing │ ───────────────────►   │  Paying  │ ──────────────────►   │ Completed │
  │          │                         │          │                       │           │
  │ Búsqueda │                         │ Efectivo │                       │  Ticket   │
  │ + Carrito│                         │ Transfer │                       │  Preview  │
  │          │                         │ Tarjeta  │                       │           │
  └──────────┘                         └──────────┘  clearCart()          └───────────┘
                                                      ◄───────────────────
```

1. **Browsing:** Buscar productos por nombre/SKU/código de barras, agregar al carrito, modificar cantidades.
2. **Paying:** Seleccionar método de pago (efectivo, transferencia, tarjeta) y procesar.
3. **Completed:** Ver ticket/comprobante y comenzar nueva venta.

### Hooks del POS

- **`usePosProductSearch`:** Búsqueda debounced contra `catalogService.getProducts()`. Mapea `Product` → `PosProduct` con variantes.
- **`usePosCart`:** Gestión completa del carrito (items, cantidades, subtotal, total), selección de método de pago, y creación del pedido vía `ordersAdmin.create()`.

### Métodos de Pago

Se usa una **interfaz genérica** `PaymentProvider` (en `payments/types.ts`) que define:
- `generateQR(amount)` — Para pago con QR.
- `generateAlias(amount)` — Para transferencia por alias/CBU.
- `waitForPosnet(amount, signal?)` — Para pago con terminal de tarjeta.

Actualmente existe una **implementación mock de MercadoPago** (`payments/mercadopago.ts`) que simula los delays de una integración real. Para conectar con el SDK real de MercadoPago, sólo hay que reemplazar los cuerpos de los métodos.

### Componentes del POS

| Componente               | Función                                     |
| ------------------------ | ------------------------------------------- |
| `ProductSearch`          | Autocomplete de productos con loader         |
| `VariantSelector`        | Modal para elegir variante de un producto    |
| `CartTable`              | Tabla del carrito con +/- y eliminar         |
| `CartSummary`            | Resumen lateral (subtotal, total, cobrar)    |
| `PaymentMethodSelector`  | Selector segmentado (efectivo/transfer/card) |
| `CashPayment`            | Formulario de pago en efectivo con vuelto    |
| `TransferPayment`        | QR o alias según modo transferencia          |
| `CardPayment`            | Pantalla de espera del posnet con cancelar   |
| `TicketPreview`          | Vista previa del comprobante final           |

---

## 8. Routing y Layouts

### Grupo `(admin)` — Rutas protegidas

```
src/app/(admin)/layout.tsx
```

Envuelve todas las páginas del panel con:
- `ProtectedView` → Redirige a `/signin` si no hay sesión.
- `AppSidebar` → Navegación lateral.
- `AppHeader` → Barra superior con usuario y notificaciones.

Cada página dentro de `(admin)/` es un archivo `page.tsx` que renderiza el módulo correspondiente:

```tsx
// src/app/(admin)/productos/page.tsx
import { ResourcePage } from "@/modules/resources/ResourcePage";
export default function ProductosPage() {
  return <ResourcePage resource="productos" />;
}
```

### Grupo `(full-width-pages)` — Sin sidebar

```
src/app/(full-width-pages)/layout.tsx
```

Layout minimalista para páginas públicas (auth, errores). No tiene sidebar ni header.

### Layout Raíz

```
src/app/layout.tsx
```

Envuelve toda la app con `AppProviders` que configura Mantine, AuthProvider y SidebarProvider.

---

## 9. Proveedores

**Archivo:** `src/providers/AppProviders.tsx`

Orden de wrapping:

```tsx
<MantineProvider theme={theme}>
  <ModalsProvider>
    <Notifications position="top-right" />
    <AuthProvider>
      <SidebarProvider>
        {children}
      </SidebarProvider>
    </AuthProvider>
  </ModalsProvider>
</MantineProvider>
```

El tema de Mantine se configura con colores personalizados y estilos globales aquí.

---

## 10. Variables de Entorno

| Variable                    | Default                  | Descripción                    |
| --------------------------- | ------------------------ | ------------------------------ |
| `NEXT_PUBLIC_API_BASE_URL`  | `http://localhost:8000`  | URL base del backend Django    |

Se usa en `httpClient.ts` para construir las URLs de las peticiones.

---

## 11. Scripts Disponibles

```bash
npm run dev       # Inicia el servidor de desarrollo (Next.js)
npm run build     # Compila para producción
npm run start     # Inicia el servidor de producción
npm run lint      # Ejecuta ESLint
```

---

## 12. Guía para Agregar un Nuevo Recurso

Para agregar un nuevo recurso CRUD (por ejemplo, "proveedores"):

### Paso 1: Agregar la instancia del admin service

En `src/lib/api/services/admin.service.ts`:

```typescript
export const suppliersAdmin = createAdminService<Record<string, unknown>>(
  "/api/admin/suppliers",
);
```

Agregar al mapa de recursos:

```typescript
const adminServiceMap = {
  // ...existentes
  proveedores: suppliersAdmin,
};
```

Y al tipo `AdminResourceName`:

```typescript
export type AdminResourceName = 
  | /* ...existentes */
  | "proveedores";
```

### Paso 2: Agregar el tipo al AuthContext

En `src/context/AuthContext.tsx`, agregar `"proveedores"` al tipo `ResourceName`.

### Paso 3: Configurar el recurso

En `src/modules/resources/config.ts`:

```typescript
proveedores: {
  name: "Proveedores",
  resource: "proveedores",
  description: "Gestión de proveedores.",
  fields: [
    { key: "name", label: "Nombre", type: "text", required: true },
    { key: "email", label: "Email", type: "text" },
  ],
  tableColumns: [
    { key: "name", label: "Nombre" },
    { key: "email", label: "Email" },
    { key: "active", label: "Estado" },
  ],
},
```

### Paso 4: Crear la página

Crear `src/app/(admin)/proveedores/page.tsx`:

```tsx
import { ResourcePage } from "@/modules/resources/ResourcePage";

export default function ProveedoresPage() {
  return <ResourcePage resource="proveedores" />;
}
```

### Paso 5: Agregar al sidebar

En `src/layout/AppSidebar.tsx`, agregar el link de navegación a la sección correspondiente.

---

## Diagrama de Dependencias entre Módulos

```
  Páginas (app/)
      │
      ├── ResourcePage ──► useCrudResource ──► getAdminService ──► httpClient
      │                                                              │
      ├── PosContent ───► usePosCart ──────► ordersAdmin ───────────┘
      │                 └► usePosProductSearch ► catalogService ────┘
      │
      ├── SignInForm ──► useAuth ──► authService ──► httpClient
      │
      └── UserDropdown ► useAuth
                             │
                         AuthContext
                             │
                         tokenManager
```

Cada capa depende únicamente de la capa inferior. Nunca hay dependencias circulares.
