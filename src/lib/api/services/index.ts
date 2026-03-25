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
} from "./admin.service";

// Types re-exported for convenience
export type { AdminService, AdminResourceName } from "./admin.service";
