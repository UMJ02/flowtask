# v58.25.8.1 — Workspace Real Data Hardening

## Objetivo

Endurecer la foundation Workspace-First para que la ruta `/app/workspace` use contexto real del workspace activo, espacios derivados de datos reales y filtros seguros por proyecto/estado sin crear tablas nuevas ni romper rutas existentes.

## Base

- Base directa: `v58.25.8 — Workspace-First Foundation`.
- No reemplaza `/app/tasks`, `/app/projects`, `/app/boards` ni `/app/reports`.
- No agrega migraciones.
- No instala dependencias.

## Cambios técnicos

### Workspace identity real

Se agrega `src/lib/workspace-system/server-data.ts` con `getWorkspaceIdentity()` usando `getWorkspaceContext()`.

- Modo personal: `workspaceId = personal:{userId}` y nombre `Mi workspace`.
- Modo organización: `workspaceId = organization:{organizationId}` y nombre desde `public.organizations`.
- Mantiene aislamiento por la cookie activa ya resuelta por las queries existentes.

### Filtros reales

`/app/workspace` ahora lee:

- `view`
- `projectId`
- `space`
- `status`

Y filtra sobre datos ya scopeados por `getTasks()` y `getProjects()`.

### Espacios reales sin BD nueva

Los espacios del sidebar ya no son hardcodeados. Se derivan de:

- `departmentName`
- `clientName`
- fallback `Operación`

Cada espacio muestra conteo real de tareas + proyectos.

### Protección contra datos cruzados

Si llega un `projectId` que no pertenece al workspace/espacio activo, la vista no cae a “todos los proyectos”. Muestra un aviso y evita enseñar datos fuera de contexto.

### Panel derecho contextual

El panel derecho ahora refleja:

- contexto activo
- espacio activo
- vencimientos ordenados por fecha
- modo personal/organización
- cantidad de proyectos después de filtros reales

## Archivos principales

- `src/app/(app)/app/workspace/page.tsx`
- `src/lib/workspace-system/server-data.ts`
- `src/lib/workspace-system/adapters.ts`
- `src/lib/workspace-system/view-state.ts`
- `src/components/workspace-system/workspace-system-page.tsx`
- `src/components/workspace-system/workspace-sidebar-pro.tsx`
- `src/components/workspace-system/workspace-right-panel.tsx`
- `src/components/workspace-system/workspace-context-header.tsx`
- `src/app/globals.css`
- `scripts/verify-v58.25.8.1.mjs`

## Validación esperada

```bash
npm run verify:current
npm run typecheck
npm run build:preflight
npm run build
```

## Notas de arquitectura

Esta versión todavía no introduce `workspace_spaces` ni `project_views`. Esa persistencia queda para una versión posterior cuando la experiencia ya esté validada con usuarios y datos reales.
