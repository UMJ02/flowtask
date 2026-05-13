# v58.25.8.5 — Workspace Full-Screen Shell + Navigation Polish

## Objetivo
Convertir `/app/workspace` en una experiencia full-screen tipo Workspace OS, sin el chrome clásico de FlowTask, para que el sidebar propio del Workspace System sea el centro de navegación principal.

## Base directa
- `v58.25.8.4 — Workspace Board Preview + Inline Create Polish`.

## Cambios incluidos
- `AppShell` detecta `pathname === "/app/workspace"` y renderiza una variante full-screen sin `AppHeader`, `AppFooter` ni `AppSidebar` clásicos.
- `WorkspaceSystemPage` deja de depender de `-mx-5/-my-5` y ahora usa `ft-ws-fullscreen` con `h-screen`.
- Sidebar Workspace refinado como Workspace Control Center:
  - Workspace activo.
  - Botón para volver al dashboard clásico.
  - Vistas del proyecto: Lista, Board, Timeline, Tabla, Canvas/Pizarras y Reportes.
  - Acceso a Biblioteca de Pizarras e IA Assistant.
  - Espacios reales y proyectos filtrados.
- Navegación de estado ya no usa `window.location.reload`; ahora usa `router.replace` + `router.refresh`.
- AppSidebar clásico agrega acceso a `Workspace Pro` desde el resto de la app.
- CSS nuevo para full-screen shell y navegación activa.

## Reglas respetadas
- No se agregan migraciones.
- No se crean tablas `workspace_spaces` ni `project_views`.
- No se reemplazan `/app/tasks`, `/app/projects`, `/app/boards` ni `/app/reports`.
- No se duplica `BoardPage`.
- No se toca `safe_delete_visual_board`.
- No se instalan dependencias nuevas.

## Archivos clave
- `src/components/layout/app-shell.tsx`
- `src/components/layout/nav-links.ts`
- `src/components/workspace-system/workspace-system-page.tsx`
- `src/components/workspace-system/workspace-sidebar-pro.tsx`
- `src/app/globals.css`
- `src/lib/release/version.ts`
- `scripts/verify-v58.25.8.5.mjs`
- `scripts/build-deploy-readiness.mjs`
- `scripts/deploy-production-readiness.mjs`

## Validación recomendada
```bash
npm run verify:current
npm run typecheck
npm run design:doctor
npm run density:guard
npm run density:guard:strict
npm run build:preflight
npm run build
```

## Nota UX
Esta versión es la primera donde `/app/workspace` se siente realmente como una pantalla principal tipo ClickUp/Notion/Asana: el usuario ya no ve dos sidebars o dos headers, sino un workspace dedicado con navegación contextual.
