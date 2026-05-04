---
name: Módulo de envíos (shipping) — estado de implementación
description: Hallazgos de la revisión del módulo shipping. Abril 2026.
type: project
---

El módulo shipping fue implementado en abril 2026 con backend completo y frontend básico funcional. El único problema pendiente confirmado es que la ruta `/envios` no aparece en el sidebar (`AppSidebar.tsx`), por lo que es inaccesible vía navegación normal. El resto de la integración está correcta.

**Why:** La integración con ResourcePage/useCrudResource es genérica; el sidebar se mantiene manualmente como array `navItems` y no se auto-descubre desde `ResourceName`.

**How to apply:** En futuras reviews, verificar siempre `AppSidebar.tsx` además del `page.tsx` de la ruta, ya que el sidebar es el único punto de entrada de navegación del admin.

Patrones adicionales observados:
- La vista `ShipmentAdminViewSet` usa `permission_classes = [IsAuthenticated]` — igual que `orders`. No existe un permission class de rol en el backend; los roles se controlan exclusivamente en el frontend con `can()`.
- El `ShipmentWriteSerializer` valida correctamente tenant isolation en `validate_order` (compara `order.tenant` con `request.tenant`).
- El campo `order` en el form de config.ts es un `type: "text"` que espera un UUID — esto es poco usable pero aceptable en un CRUD genérico sin selector de pedidos.
- No hay `admin.py` en shipping (modelo no registrado en Django admin). Igual que orders y coupons — parece patrón del proyecto.
