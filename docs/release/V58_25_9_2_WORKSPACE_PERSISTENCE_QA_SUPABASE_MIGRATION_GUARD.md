# FlowTask v58.25.9.2 — Workspace Persistence QA + Supabase Migration Guard

## Objetivo

Cerrar la primera capa de persistencia Workspace con guardas reales para Supabase y QA específico antes de seguir expandiendo espacios, vistas o dashboards.

Esta versión no agrega nuevas tablas. Usa la migración existente `0056_v58_25_9_workspace_persistence_foundation.sql`, pero evita que `/app/workspace` dependa ciegamente de `workspace_spaces` y `project_views`.

## Cambios principales

- Nuevo estado `WorkspacePersistenceGuardStatus`.
- Nuevo helper server-safe `getWorkspacePersistenceGuardStatus()`.
- Detección de tablas faltantes, acceso bloqueado por RLS o persistencia parcial.
- `/app/workspace` consulta `workspace_spaces` solo cuando el guard confirma disponibilidad.
- `/app/workspace` consulta `project_views` solo cuando el guard confirma disponibilidad.
- `WorkspaceSavedViewsManager` bloquea escrituras cuando `project_views` no está listo.
- `WorkspaceRightPanel` muestra estado de Migration Guard.
- Nuevo script `npm run workspace:doctor`.
- `build:preflight`, `deploy:readiness` y `deploy:production:ready` alineados con v58.25.9.2.

## Regla crítica

La app debe seguir funcionando en estos casos:

1. La migración 0056 ya fue aplicada.
2. La migración 0056 todavía no fue aplicada.
3. Solo una de las dos tablas existe.
4. Las tablas existen pero RLS bloquea acceso.
5. El usuario está en workspace personal.
6. El usuario está en organización.
7. El proyecto no tiene vistas guardadas.
8. No hay proyectos/tareas/archivos/actividad.

## Archivos modificados

- `package.json`
- `package-lock.json`
- `src/lib/release/version.ts`
- `src/lib/workspace-system/view-state.ts`
- `src/lib/workspace-system/server-data.ts`
- `src/app/(app)/app/workspace/page.tsx`
- `src/components/workspace-system/workspace-system-page.tsx`
- `src/components/workspace-system/workspace-saved-views-manager.tsx`
- `src/components/workspace-system/workspace-right-panel.tsx`
- `src/app/globals.css`
- `scripts/workspace-persistence-doctor.mjs`
- `scripts/verify-v58.25.9.2.mjs`
- `scripts/build-deploy-readiness.mjs`
- `scripts/deploy-production-readiness.mjs`

## Validación recomendada

```bash
npm run workspace:doctor
npm run verify:current
npm run typecheck
npm run build:preflight
npm run build
```

## Resultado esperado

Workspace sigue usando datos reales del app. Si las tablas de persistencia están listas, permite espacios/vistas guardadas. Si no están listas, muestra guardas profesionales y mantiene fallback sin romper la experiencia.
