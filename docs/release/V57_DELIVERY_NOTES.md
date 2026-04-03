# FlowTask — V57 Delivery Notes

## Release
- versión: `57.0.0-platform-control`
- nombre: `v57 Platform Control`

## Qué se integró
- refinamiento total de `src/app/(app)/app/platform/page.tsx`
- consultas nuevas para operación de plataforma en `src/lib/queries/admin.ts`
- ampliación de tipos de admin en `src/types/admin.ts`
- paneles nuevos:
  - `src/components/admin/admin-platform-pulse.tsx`
  - `src/components/admin/admin-errors-panel.tsx`
  - `src/components/admin/admin-usage-panel.tsx`
- visibilidad condicional de acceso platform en shell y navegación para admins
- nuevo verificador `scripts/verify-v57.mjs`

## Resultado
FlowTask queda con una capa real de operación SaaS para owner/platform admin, con visibilidad global de soporte, uso, errores y cuentas sin rehacer el core del producto.
