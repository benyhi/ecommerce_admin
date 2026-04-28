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

// ── Product detail ──────────────────────────────────────

export type ProductAttribute = {
  id: string;
  product: string;
  name: string;
  value: string;
  order: number;
};

export type ProductBadge = {
  id: string;
  title: string;
  description: string;
  icon: "truck" | "shield" | "box" | "check" | "star" | "zap";
  active: boolean;
  order: number;
};

// ── Payments ────────────────────────────────────────────

export type PaymentGateway = "mercadopago" | "naranja_x" | "transfer" | "card" | "debit";

export type PaymentStatus =
  | "pending"
  | "in_process"
  | "approved"
  | "rejected"
  | "cancelled"
  | "refunded"
  | "charged_back";

export type PaymentAttempt = {
  id: string;
  status: "pending" | "success" | "failed";
  error_message: string;
  created_at: string;
};

export type Payment = {
  id: string;
  gateway: PaymentGateway;
  gateway_display: string;
  status: PaymentStatus;
  status_display: string;
  amount: string;
  currency: string;
  installments: number;
  installment_amount: string | null;
  payer_name: string;
  payer_email: string;
  payer_phone?: string;
  external_id: string;
  external_status?: string;
  checkout_url: string | null;
  gateway_response?: Record<string, unknown>;
  notes?: string;
  order_number: string | null;
  attempt_count?: number;
  attempts?: PaymentAttempt[];
  created_at: string;
  updated_at: string;
};

export type GatewayConfig = {
  id: string;
  gateway: PaymentGateway;
  gateway_display: string;
  is_enabled: boolean;
  config: Record<string, string>;
  updated_at: string;
};

// ── Orders ──────────────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderPaymentMethod = "cash" | "transfer" | "card" | "mercadopago";
export type OrderPaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type OrderItem = {
  id: string;
  product: string | null;
  product_name: string;
  quantity: number;
  unit_price: string;
  subtotal: string;
};

export type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: OrderStatus;
  payment_method: OrderPaymentMethod;
  payment_status: OrderPaymentStatus;
  notes: string;
  subtotal: string;
  discount: string;
  total: string;
  item_count?: number;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
};

export type OrderWrite = {
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  status?: OrderStatus;
  payment_method?: OrderPaymentMethod;
  payment_status?: OrderPaymentStatus;
  notes?: string;
  discount?: string;
  items?: {
    product?: string | null;
    product_name: string;
    quantity: number;
    unit_price: string;
  }[];
};

// ── Coupons ─────────────────────────────────────────────

export type CouponDiscountType = "percentage" | "fixed";

export type Coupon = {
  id: string;
  code: string;
  description: string;
  discount_type: CouponDiscountType;
  discount_type_display: string;
  value: string;
  min_order_amount: string;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  is_valid: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CouponWrite = {
  code: string;
  description?: string;
  discount_type: CouponDiscountType;
  value: string;
  min_order_amount?: string;
  max_uses?: number | null;
  is_active?: boolean;
  expires_at?: string | null;
};

export type CouponValidationResult = {
  valid: boolean;
  code: string;
  discount_type?: CouponDiscountType;
  value?: string;
  discount_amount?: string;
  message: string;
};

// ── Query params ────────────────────────────────────────

export type QueryParams = {
  page?: number;
  search?: string;
  [key: string]: string | number | undefined;
};
