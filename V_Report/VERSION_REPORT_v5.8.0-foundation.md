# FlowTask v5.8.0-foundation

Base: `v5.7.2-health`

## Objetivo
Consolidar la arquitectura visible del producto antes de seguir agregando capacidades.

## Cambios aplicados
- Se reemplazó `AppRoute = any` por tipado de rutas internas conocidas, dinámicas y con query/hash.
- Se agregó validación centralizada de rutas para navegación segura y refactors más confiables.
- La navegación principal quedó separada entre capa `core` y capa de `organization`.
- La vista `/app/intelligence` se convirtió en hub foundation para centralizar planning, risk, execution y la salida ejecutiva.
- Se actualizó documentación y versionado a `v5.8.0-foundation`.

## Archivos tocados
- `src/lib/navigation/routes.ts`
- `src/components/layout/nav-links.ts`
- `src/components/layout/app-sidebar.tsx`
- `src/components/layout/mobile-nav.tsx`
- `src/app/(app)/app/intelligence/page.tsx`
- `package.json`
- `package-lock.json`
- `README.md`
- `V_Report/VERSION_REPORT_v5.8.0-foundation.md`

## Validación objetivo
- `npm run typecheck`
- revisión estructural de navegación y consolidación foundation
