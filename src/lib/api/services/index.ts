// Services
export { authService } from "./auth.service";
export { catalogService } from "./catalog.service";
export {
  createAdminService,
  getAdminService,
  categoriesAdmin,
  productsAdmin,
  ordersAdmin,
  usersAdmin,
  customersAdmin,
  configAdmin,
  metricsAdmin,
  couponsAdmin,
} from "./admin.service";
export { couponsPublic } from "./coupons.service";

// Types re-exported for convenience
export type { AdminService, AdminResourceName } from "./admin.service";
