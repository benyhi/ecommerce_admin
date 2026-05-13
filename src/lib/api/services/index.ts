// Services
export { authService } from "./auth.service";
export { catalogService } from "./catalog.service";
export {
  createAdminService,
  getAdminService,
  categoriesAdmin,
  subcategoriesAdmin,
  productsAdmin,
  ordersAdmin,
  usersAdmin,
  customersAdmin,
  configAdmin,
  metricsAdmin,
  couponsAdmin,
} from "./admin.service";
export { couponsPublic } from "./coupons.service";
export { notificationsService } from "./notifications.service";
export { plansService } from "./plans.service";
export type { PlanDetail, LicenseDetail, LicenseUpdatePayload } from "./plans.service";

// Types re-exported for convenience
export type { AdminService, AdminResourceName } from "./admin.service";
