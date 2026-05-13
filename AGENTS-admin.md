# AGENTS.md

## Project context

This repository contains a multi-tenant Ecommerce API built with Django 6.0 and Django REST Framework.

Core characteristics:

- Framework: Django 6.0 + Django REST Framework.
- Authentication: JWT with `djangorestframework-simplejwt`.
- Database: SQLite in development.
- Architecture: multi-tenant.
- IDs: UUID v4.
- Pagination: DRF `PageNumberPagination`.
- Local base URL: `http://localhost:8000`.

Codex should treat this file as the main project guide when reading, editing, testing, or reviewing code in this repository.

## Working rules for Codex

- Preserve tenant isolation as the highest priority.
- Do not expose data from one tenant to another tenant.
- Before changing behavior, inspect the existing models, serializers, views, middleware, permissions, settings, and URL routing.
- Make the smallest safe change that satisfies the task.
- Preserve existing API response shapes unless the task explicitly asks to change them.
- Preserve trailing-slash endpoint conventions.
- Do not introduce production dependencies without a clear reason.
- Do not commit secrets, tokens, access keys, bucket names, or private credentials.
- Use environment variables for external services such as S3 or Cloudflare R2.
- Prefer explicit, readable code over clever abstractions.
- If a task touches API behavior, add or update tests when the project has a test setup.
- After modifying code, run the most relevant checks available in the repo. If commands are not documented, inspect the project first and use the standard Django checks only when applicable.

Recommended checks when available:

```bash
python manage.py check
python manage.py test
```

If the project uses another runner, virtual environment, package manager, or CI command, prefer the repo's existing convention.

## Multi-tenancy rules

The system is multi-tenant. Each tenant owns its own products, categories, users, and branding configuration.

Tenant resolution priority:

1. HTTP header: `X-Tenant: <slug>`
2. Query parameter: `?tenant=<slug>`
3. Tenant from the authenticated user as fallback

Expected behavior:

- `TenantMiddleware` resolves the tenant and assigns it to `request.tenant`.
- Models using `TenantAwareModelMixin` auto-assign the tenant when saving.
- Tenant-owned querysets must be scoped to the current tenant.
- Public catalog endpoints still require tenant scoping.
- Authenticated fallback tenant must not override an explicit valid header or query tenant.
- Invalid, inactive, or missing tenants should be handled explicitly according to existing project behavior.

When adding new tenant-aware models, views, serializers, managers, or admin logic, ensure they cannot leak records across tenants.

## Authentication

Authentication uses JWT via `djangorestframework-simplejwt`.

Access tokens are sent with:

```http
Authorization: Bearer <token>
```

Refresh tokens are used to obtain new access tokens.

Auth endpoint behavior:

- `POST /api/auth/login/` is public.
- `POST /api/auth/refresh/` is public.
- `GET /api/auth/me/` requires JWT authentication.

Login validation rules:

- `tenant` is required in the login payload.
- The tenant must exist.
- The tenant must be active.
- Email lookup is case-insensitive.
- The user must be active.
- Credentials must match the user within the tenant.

Do not weaken authentication behavior without explicit instruction.

## Public catalog behavior

Catalog endpoints are public, but tenant-scoped.

Public catalog endpoints:

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/catalog/categories/` | No | List active categories for tenant |
| `GET` | `/api/catalog/categories/{id}/` | No | Get category detail |
| `GET` | `/api/catalog/products/` | No | List active products for tenant |
| `GET` | `/api/catalog/products/{id}/` | No | Get product detail |

Catalog rules:

- Only active categories should be listed.
- Only active products should be listed.
- Results must belong to the current tenant.
- Category list responses include nested products.
- Product list/detail responses include category and option groups.
- Product list queries should remain optimized with `select_related('category')` and `prefetch_related('option_groups__options')` or equivalent.
- Preserve DRF paginated response format: `count`, `next`, `previous`, `results`.

## Endpoint contracts

### `POST /api/auth/login/`

Request:

```json
{
  "email": "admin@tienda.com",
  "password": "password123",
  "tenant": "mi-tienda"
}
```

Successful response:

```json
{
  "access": "<jwt_access_token>",
  "refresh": "<jwt_refresh_token>",
  "user": {
    "id": "<uuid>",
    "email": "admin@tienda.com",
    "role": "admin",
    "tenant": {
      "id": "<uuid>",
      "slug": "mi-tienda",
      "name": "Mi Tienda"
    }
  }
}
```

Expected errors:

| Code | Reason |
| --- | --- |
| `400` | Missing or invalid fields |
| `401` | Invalid credentials |
| `404` | Tenant not found or inactive |

### `POST /api/auth/refresh/`

Request:

```json
{
  "refresh": "<jwt_refresh_token>"
}
```

Successful response:

```json
{
  "access": "<jwt_access_token>"
}
```

### `GET /api/auth/me/`

Request:

```http
GET /api/auth/me/
Authorization: Bearer <access_token>
```

Successful response:

```json
{
  "id": "<uuid>",
  "email": "admin@tienda.com",
  "role": "admin",
  "tenant": {
    "id": "<uuid>",
    "slug": "mi-tienda",
    "name": "Mi Tienda"
  }
}
```

Expected error:

| Code | Reason |
| --- | --- |
| `401` | Missing, invalid, or expired token |

### `GET /api/catalog/categories/`

Request:

```http
GET /api/catalog/categories/
X-Tenant: mi-tienda
```

Query parameters:

| Param | Type | Description |
| --- | --- | --- |
| `page` | int | Page number |

Response shape:

```json
{
  "count": 3,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "<uuid>",
      "name": "Laptops",
      "active": true,
      "order": 1,
      "products": [
        {
          "id": "<uuid>",
          "name": "MacBook Pro 16",
          "description": "Laptop de alto rendimiento",
          "price": "2499.99",
          "active": true,
          "order": 1,
          "image_filename": "images/20260324_143000_macbook.jpg",
          "image_url": "https://cdn.example.com/images/20260324_143000_macbook.jpg"
        }
      ]
    }
  ]
}
```

### `GET /api/catalog/categories/{id}/`

Returns one category with its products. Preserve the same item structure used by the category list.

### `GET /api/catalog/products/`

Request:

```http
GET /api/catalog/products/
X-Tenant: mi-tienda
```

Query parameters:

| Param | Type | Description |
| --- | --- | --- |
| `tenant` | string | Tenant slug alternative to `X-Tenant` |
| `page` | int | Page number |

Response shape:

```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "<uuid>",
      "name": "MacBook Pro 16",
      "description": "Laptop de alto rendimiento",
      "price": "2499.99",
      "active": true,
      "order": 1,
      "image_filename": "images/20260324_143000_macbook.jpg",
      "image_url": "https://cdn.example.com/images/20260324_143000_macbook.jpg",
      "category": {
        "id": "<uuid>",
        "name": "Laptops",
        "order": 1
      },
      "option_groups": [
        {
          "id": "<uuid>",
          "name": "Almacenamiento",
          "required": true,
          "max_choices": 1,
          "order": 1,
          "options": [
            {
              "id": "<uuid>",
              "name": "512GB SSD",
              "price": "0.00",
              "active": true,
              "order": 1
            }
          ]
        }
      ]
    }
  ]
}
```

### `GET /api/catalog/products/{id}/`

Returns one product with category and option groups. Preserve the same item structure used by the product list.

## Data model contracts

### Tenant

Fields:

- `id`: UUID primary key.
- `slug`: unique URL identifier.
- `name`: tenant name.
- `is_active`: whether the tenant is active.
- `created_at`: creation timestamp.
- `updated_at`: last update timestamp.

### TenantConfig

Branding and store configuration for one tenant.

Fields include:

- `tenant`
- `store_name`
- `brand_name`
- `logo_url`
- `tagline`
- `color_primary`
- `color_secondary`
- `color_primary_text`
- `contact_address`
- `contact_phone`
- `contact_whatsapp`
- `contact_email`
- `contact_business_hours`
- `contact_map_embed_url`
- `seo_title`
- `seo_description`
- `seo_keywords`
- `seo_og_image_url`
- `extra_config`

### User

Extends Django `AbstractUser`.

Important fields:

- `id`: UUID primary key.
- `email`: unique per tenant.
- `tenant`: owning tenant.
- `role`: one of `admin`, `employee`, `editor`, `read`.

Constraint:

- Unique pair: `(tenant, email)`.

### Category

Fields:

- `id`: UUID primary key.
- `tenant`: owning tenant.
- `name`: max 100 characters.
- `active`: visibility flag.
- `order`: display order.
- `created_at`
- `updated_at`

### Product

Fields:

- `id`: UUID primary key.
- `tenant`: owning tenant.
- `category`: nullable category.
- `name`: max 100 characters.
- `description`
- `price`: decimal with 10 digits and 2 decimal places.
- `image_filename`: S3/R2 object name.
- `image_url`: generated public CDN URL property.
- `active`
- `order`
- `created_at`
- `updated_at`

### OptionGroup

Fields:

- `id`: UUID primary key.
- `tenant`: owning tenant.
- `product`: related product.
- `name`: group name, for example `Color`.
- `required`: whether selection is required.
- `max_choices`: maximum selectable options.
- `order`: display order.

### Option

Fields:

- `id`: UUID primary key.
- `tenant`: owning tenant.
- `group`: related option group.
- `name`: option name.
- `price`: additional price, default `0`.
- `active`
- `order`

## Roles and permissions

Available roles:

| Role | Meaning |
| --- | --- |
| `admin` | Administrator |
| `employee` | Employee |
| `editor` | Editor |
| `read` | Read-only |

Current endpoint permissions:

| Endpoint | Required permission |
| --- | --- |
| `POST /api/auth/login/` | None |
| `POST /api/auth/refresh/` | None |
| `GET /api/auth/me/` | `IsAuthenticated` |
| `GET /api/catalog/*` | None, public |
| `/admin/` | `is_staff=True` |

Permission classes `IsAdmin`, `IsEmployee`, `IsEditor`, and `IsReadOnly` may exist but are not currently applied to catalog endpoints. Do not assume role-based catalog restrictions unless the code or task explicitly requires them.

## Image handling

Images are managed by `ImageService` in `cloud/services.py`.

Upload flow through Django Admin:

1. Admin uploads an image in the product form.
2. `ImageService.upload()` validates extension and size.
3. A unique filename is generated with a timestamp.
4. The file is uploaded to S3 or Cloudflare R2.
5. `image_filename` is stored in the `Product` model.
6. `image_url` generates the public CDN URL when needed.

Image restrictions:

| Restriction | Value |
| --- | --- |
| Valid extensions | `.jpg`, `.jpeg`, `.png`, `.webp` |
| Maximum size | 5 MB |

Environment variables:

| Variable | Purpose |
| --- | --- |
| `AWS_ACCESS_KEY_ID` | S3/R2 access key |
| `AWS_SECRET_ACCESS_KEY` | S3/R2 secret key |
| `AWS_BUCKET_NAME` | Bucket name |
| `AWS_ENDPOINT_URL` | Endpoint URL, especially for R2 |
| `AWS_PUBLIC_URL` | Public CDN URL |
| `AWS_REGION` | Region, default `auto` |

Never hardcode these values.

## CORS

Allowed origins:

- `http://localhost:3000`
- `http://127.0.0.1:3000`

Custom allowed headers:

- `X-Tenant`

Credentials are enabled.

When changing CORS, preserve local frontend development support unless explicitly instructed otherwise.

## Implementation guidance

When editing API code:

- Keep serializers aligned with documented response shapes.
- Keep tenant scoping in querysets, serializer context, admin logic, and service functions.
- Use `DecimalField` or decimal-safe handling for prices.
- Avoid converting prices to floats.
- Preserve UUID identifiers in URLs and responses.
- Keep active/inactive filtering explicit.
- Keep nested option group and option ordering stable.
- Prefer `select_related` for single relations and `prefetch_related` for nested collections.
- Do not silently alter pagination behavior.
- Do not silently make public endpoints private or private endpoints public.
- Ensure errors use consistent DRF response patterns.

When editing auth code:

- Preserve case-insensitive email lookup.
- Validate tenant existence and active status.
- Validate user active status.
- Keep returned user and tenant shape stable.
- Avoid leaking whether a user exists outside the tenant unless current behavior already does so.

When editing image code:

- Preserve extension allowlist.
- Preserve 5 MB max size unless explicitly changed.
- Keep storage operations behind `ImageService`.
- Do not store binary image data in the database.
- Keep CDN URL generation centralized.

## Suggested test checklist

When relevant, cover:

- Login with valid tenant, email, and password.
- Login with invalid password.
- Login with missing tenant.
- Login with inactive tenant.
- Login with inactive user.
- Case-insensitive email login.
- `/api/auth/me/` with valid token.
- `/api/auth/me/` without token.
- Tenant resolution by `X-Tenant`.
- Tenant resolution by `tenant` query parameter.
- Authenticated user tenant fallback.
- Catalog list only returns records for current tenant.
- Catalog list excludes inactive categories.
- Catalog list excludes inactive products.
- Product detail includes category and option groups.
- Category detail includes nested products.
- Image upload rejects invalid extensions.
- Image upload rejects files larger than 5 MB.

## Review checklist

Before finishing a change, Codex should review:

- Could this leak data across tenants?
- Did any public/private permission change?
- Did response shapes change unintentionally?
- Are querysets correctly scoped and optimized?
- Are prices handled as decimals?
- Are secrets still kept out of code?
- Are migrations needed for model changes?
- Were relevant checks or tests run?
- If tests could not be run, is the reason clearly stated?
