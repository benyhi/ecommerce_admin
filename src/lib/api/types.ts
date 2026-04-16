// ── Pagination ──────────────────────────────────────────

/** DRF standard paginated response */
export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

// ── Errors ──────────────────────────────────────────────

export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string[]>;

  constructor(
    status: number,
    message: string,
    fieldErrors: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

// ── Auth ────────────────────────────────────────────────

export type Tenant = {
  id: string;
  slug: string;
  name: string;
};

export type UserInfo = {
  id: string;
  email: string;
  role: UserRole;
  tenant: Tenant;
};

export type UserRole = "admin" | "employee" | "editor" | "read";

export type LoginRequest = {
  email: string;
  password: string;
  tenant: string;
};

export type LoginResponse = {
  access: string;
  refresh: string;
  user: UserInfo;
};

export type RefreshResponse = {
  access: string;
};

// ── Admin Users ─────────────────────────────────────────

export type UserStatus = "active" | "inactive";

export type TenantUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
};

export type TenantUserWrite = {
  name?: string;
  email: string;
  role: UserRole;
  status?: UserStatus;
  password?: string;
};

// ── Catalog ─────────────────────────────────────────────

export type Category = {
  id: string;
  name: string;
  active: boolean;
  order: number;
  products?: ProductSummary[];
};

export type ProductSummary = {
  id: string;
  name: string;
  description: string;
  price: string;
  active: boolean;
  order: number;
  image_filename: string | null;
  image_url: string | null;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: string;
  active: boolean;
  order: number;
  image_filename: string | null;
  image_url: string | null;
  category: CategorySummary | null;
  option_groups: OptionGroup[];
};

export type CategorySummary = {
  id: string;
  name: string;
  order: number;
};

export type OptionGroup = {
  id: string;
  name: string;
  required: boolean;
  max_choices: number;
  order: number;
  options: Option[];
};

export type Option = {
  id: string;
  name: string;
  price: string;
  active: boolean;
  order: number;
};

// ── Website / Site config ────────────────────────────────────────────────────

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string;
  published_at: string | null;
  active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
};

export type CarouselBanner = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  link_url: string;
  button_text: string;
  order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type FeaturedProductItem = {
  id: string;
  product: string;
  product_detail: Product | null;
  order: number;
  active: boolean;
  created_at: string;
};

// ── Query params ────────────────────────────────────────

export type QueryParams = {
  page?: number;
  search?: string;
  [key: string]: string | number | undefined;
};
