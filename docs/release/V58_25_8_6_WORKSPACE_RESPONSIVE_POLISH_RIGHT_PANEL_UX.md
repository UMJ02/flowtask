# v58.25.8.6 — Workspace Responsive Polish + Right Panel UX

## Objetivo
Pulir la experiencia Workspace-First para que `/app/workspace` sea usable en desktop, tablet y móvil sin volver al shell clásico, y mejorar el panel derecho para que funcione como panel contextual real tipo ClickUp/Notion/Asana.

## Base
- Base directa: `v58.25.8.5 — Workspace Full-Screen Shell + Navigation Polish`.
- No cambia la arquitectura de datos.
- No agrega migraciones.
- No reemplaza rutas clásicas.

## Cambios principales
- Sidebar desktop sigue fija como Workspace Control Center.
- En mobile/tablet aparece botón `Workspace` que abre un drawer lateral.
- Drawer móvil cierra al navegar a view, espacio, proyecto, boards, dashboard o IA.
- Botón `Resumen` permite mostrar/ocultar el panel derecho en mobile.
- Botón `Panel` permite colapsar el panel derecho en desktop amplio.
- Action bar responde mejor en pantallas pequeñas.
- Right panel ahora es sticky en desktop 2XL.
- Right panel agrega métricas compactas: Importantes, Vencidas, Hoy y Proyectos.
- Right panel agrega progress ring visual sin dependencia nueva.
- Próximos vencimientos muestran proyecto/contexto y datos reales cuando existen.
- IA contextual ahora muestra una señal principal: vencidas, importantes, hoy o workspace saludable.

## Archivos modificados
- `src/components/workspace-system/workspace-system-page.tsx`
- `src/components/workspace-system/workspace-sidebar-pro.tsx`
- `src/components/workspace-system/workspace-right-panel.tsx`
- `src/app/globals.css`
- `src/lib/release/version.ts`
- `package.json`
- `package-lock.json`
- `scripts/verify-v58.25.8.6.mjs`
- `scripts/build-deploy-readiness.mjs`
- `scripts/deploy-production-readiness.mjs`
- `docs/release/V58_25_8_6_WORKSPACE_RESPONSIVE_POLISH_RIGHT_PANEL_UX.md`
- `docs/qa/FLOWTASK_V58_25_8_6_WORKSPACE_RESPONSIVE_POLISH_RIGHT_PANEL_UX_QA.md`

## No incluido
- No se agregan tablas `workspace_spaces` ni `project_views`.
- No se instala ninguna dependencia nueva.
- No se reemplaza `/app/tasks`, `/app/projects`, `/app/boards` ni `/app/reports`.
- No se toca `safe_delete_visual_board`.
- No se duplica `BoardPage`.

## Validación esperada
```bash
npm run verify:current
npm run typecheck
npm run build:preflight
npm run build
```

## Resultado esperado
`/app/workspace` debe sentirse como un workspace full-screen profesional: navegación lateral en desktop, drawer móvil, views horizontales con scroll, acciones compactas, panel derecho contextual y métricas útiles sin romper la app existente.
