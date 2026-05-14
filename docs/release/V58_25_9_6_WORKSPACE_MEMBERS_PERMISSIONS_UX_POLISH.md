# FlowTask v58.25.9.6 — Workspace Members + Permissions UX Polish

## Objetivo

Pulir la experiencia Workspace-First para que el usuario entienda claramente quién participa en el contexto activo y qué acciones puede ejecutar según sus permisos reales.

## Cambios principales

- Nuevo modelo `WorkspacePermissionSummary`.
- Nuevo modelo `WorkspaceMemberSummary`.
- Nuevo helper server-safe `getWorkspacePermissionSummary()`.
- Nuevo helper server-safe `getWorkspaceProjectMembers()`.
- Nuevo componente `WorkspaceMembersPermissionsCard`.
- Nuevo componente `WorkspacePermissionBanner`.
- `/app/workspace` ahora carga permisos y miembros reales del proyecto/workspace.
- Home del proyecto muestra bloque de miembros y acciones disponibles.
- Right Panel muestra equipo/permisos del contexto activo.
- Quick create se bloquea visualmente si el usuario no puede crear tareas.
- Saved Views Manager bloquea guardar/editar/default/eliminar si el usuario no tiene permiso.
- Spaces Manager bloquea crear/renombrar/archivar/asignar proyectos si el usuario no tiene permiso.
- Files Upload Entry bloquea subida de archivos cuando el rol no permite cargar archivos.
- CSS nuevo para banners de permisos, chips de rol, filas de miembros y acciones disponibles.

## Seguridad

No agrega migraciones nuevas. Usa RLS existente y la lectura server-safe para reflejar permisos en UI. La UI no sustituye las policies: solo evita acciones confusas antes de que Supabase las bloquee.

## Archivos clave

- `src/lib/workspace-system/view-state.ts`
- `src/lib/workspace-system/server-data.ts`
- `src/app/(app)/app/workspace/page.tsx`
- `src/components/workspace-system/workspace-members-permissions.tsx`
- `src/components/workspace-system/workspace-system-page.tsx`
- `src/components/workspace-system/workspace-right-panel.tsx`
- `src/components/workspace-system/views/home-view.tsx`
- `src/components/workspace-system/views/files-view.tsx`
- `src/components/workspace-system/workspace-saved-views-manager.tsx`
- `src/components/workspace-system/workspace-spaces-manager.tsx`
- `src/components/workspace-system/workspace-files-upload-entry.tsx`
- `src/app/globals.css`

## Validación recomendada

```bash
npm run workspace:doctor
npm run verify:current
npm run typecheck
npm run build:preflight
npm run build
```
