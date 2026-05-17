# FlowTask — v58.26.4 Workspace Collaboration + Share + Mobile Polish

Base: **v58.26.3 — Workspace Notifications + Activity Automation Polish**

## Objetivo

Agregar la base de persistencia del Workspace System para guardar espacios y vistas por proyecto, manteniendo la experiencia Workspace-First ya conectada a datos reales.

## Cambios principales

- Mantiene migración `0056_v58_25_9_workspace_persistence_foundation.sql`.
- Agrega UI para guardar, renombrar, abrir, marcar default y eliminar `project_views`.
- Nueva tabla opcional: `workspace_spaces`.
- Nueva tabla opcional: `project_views`.
- Helpers server-safe: `getWorkspacePersistedSpaces()` y `getWorkspaceProjectViews()`.
- `/app/workspace` usa espacios persistidos cuando existen y mantiene fallback generado por datos reales.
- Tabs superiores muestran indicador de vista persistida cuando aplica.
- Panel derecho muestra bloque de Persistencia Workspace.
- RLS para modo personal y organización.

## Validación recomendada

```bash
npm install
npm run verify:current
npm run design:doctor
npm run density:guard
npm run density:guard:strict
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```

## Nota

Esta versión introduce la base DB opcional para persistencia. No reemplaza rutas existentes, no duplica BoardPage y no toca `safe_delete_visual_board`.


## v58.25.9.8 — Workspace Navigation + Search Command Center

- Agrega `WorkspaceCommandCenter` para buscar y navegar tareas, proyectos, espacios, vistas guardadas, pizarras, archivos y acciones rápidas.
- Entrada visible “Buscar o ejecutar” y atajo `⌘K` / `Ctrl+K`.
- Resultados con navegación por teclado: ↑/↓, Enter y Esc.
- Acción rápida “Crear tarea” respeta permisos del workspace.
- No requiere migración nueva ni dependencias nuevas.


## v58.25.9.3 — Workspace Saved Views Defaults + Filters Persistence

- Saved views now persist the operational state of `/app/workspace`, including status filter, grouping, sort and visible columns metadata.
- `savedViewId` can reopen a saved configuration without leaving the workspace.
- Default project views can be applied automatically when opening a project without an explicit `view` query.
- No new migration is required; this version uses `project_views.config` from migration `0056`.

## v58.25.9.2 — Workspace Persistence QA + Supabase Migration Guard

Esta versión agrega guardas de persistencia para que `/app/workspace` siga funcionando aunque la migración `0056_v58_25_9_workspace_persistence_foundation.sql` no se haya aplicado todavía o esté parcialmente disponible.

Comandos clave:

```bash
npm run workspace:doctor
npm run verify:current
npm run typecheck
npm run build:preflight
npm run build
```

La persistencia Workspace usa `workspace_spaces` y `project_views` cuando están listas. Si no están listas, FlowTask mantiene fallback con espacios generados desde datos reales y bloquea escrituras de Saved Views con feedback profesional.


## v58.25.9.4 — Workspace Spaces Manager + Project Organization

- Agrega `workspace_space_projects` como capa opcional para asignar proyectos reales a espacios persistidos.
- `/app/workspace` ahora puede crear, renombrar, archivar espacios y organizar proyectos sin reemplazar rutas clásicas.
- Mantiene fallback con espacios generados si la migración 0057 no está disponible.

## v58.25.9.5 — Workspace Project Home Dashboard

Agrega la vista `Home` al Workspace System para que cada proyecto/espacio tenga una portada operativa con progreso, tareas importantes, próximos vencimientos, pizarras, archivos, actividad reciente, vistas guardadas y accesos rápidos. Requiere aplicar `0058_v58_25_9_5_project_views_home_view_support.sql` para permitir vistas guardadas de tipo `home`.

## v58.25.9.7 — Workspace Empty States + Client QA Hardening

Agrega estados vacíos profesionales y un panel `Workspace Health` para validar visualmente persistencia, espacios, vistas guardadas, permisos y disponibilidad de datos dentro de `/app/workspace`. No agrega migraciones nuevas.

## v58.26.0 — Workspace Production Readiness

La línea Workspace-First queda consolidada para validación de producción.

Validación recomendada:

```bash
nvm use 20
npm install
npm run workspace:doctor
npm run workspace:production:ready
npm run verify:current
npm run typecheck
npm run build:preflight
npm run build
```

Migraciones requeridas para la experiencia Workspace persistente:

- `0056_v58_25_9_workspace_persistence_foundation.sql`
- `0057_v58_25_9_4_workspace_space_project_assignments.sql`
- `0058_v58_25_9_5_project_views_home_view_support.sql`

Rutas clásicas que deben mantenerse operativas durante esta etapa:

- `/app/tasks`
- `/app/projects`
- `/app/boards`
- `/app/reports`


## v58.26.2 — Workspace Performance + Query Optimization

Optimiza `/app/workspace` con carga progresiva por vista: reportes, pizarras, archivos y actividad ya no se cargan siempre. Agrega `src/lib/workspace-system/performance.ts`, `WORKSPACE_QUERY_LIMITS` y `npm run workspace:performance:ready`. No requiere migración nueva.

## v58.26.1 — Workspace Production QA Fixes + Real Environment Hardening

Esta versión agrega un pase post-readiness para entorno real. Incluye migración 0059, idempotencia de triggers para Workspace persistence y el nuevo comando:

```bash
npm run workspace:real-env:ready
```

Validación recomendada:

```bash
nvm use 20
npm install
npm run workspace:doctor
npm run workspace:production:ready
npm run workspace:real-env:ready
npm run verify:current
npm run typecheck
npm run build:preflight
npm run build
```

## v58.26.3 — Workspace Notifications + Activity Automation Polish

Esta versión conecta el Workspace contextual con señales reales de notificaciones y actividad. Agrega un panel de automatización contextual en el Right Panel, resume notificaciones visibles, sugiere acciones a partir de tareas vencidas/importantes/de hoy, archivos recientes y actividad reciente, y mantiene carga progresiva mediante `buildWorkspaceLoadPlan()`.

Comando nuevo:

```bash
npm run workspace:automation:ready
```


## v58.26.4 — Workspace Collaboration + Share + Mobile Polish

Esta versión agrega una capa de colaboración controlada para el Workspace System sin tocar RLS ni agregar migraciones.

Incluye:

- Nuevo `WorkspaceSharePanel` para compartir contexto de workspace/proyecto.
- Botón `Compartir` conectado desde el header contextual y mobile toolbar.
- Copiar link de Home, proyecto activo, vista actual y vista guardada activa.
- Lista de miembros y roles con mejor UX colaborativa.
- Estados claros cuando el usuario no puede compartir o gestionar acceso.
- Links internos protegidos por los permisos existentes del proyecto/workspace.
- Pulido responsive del panel de compartir y action bar mobile.
- Nuevo comando `npm run workspace:collaboration:ready`.

Validación recomendada:

```bash
nvm use 20
npm install
npm run workspace:doctor
npm run workspace:production:ready
npm run workspace:real-env:ready
npm run workspace:performance:ready
npm run workspace:automation:ready
npm run workspace:collaboration:ready
npm run verify:current
npm run typecheck
npm run build:preflight
npm run build
```


## v58.26.5 — Workspace Error Recovery + Final QA Hardening

Esta versión agrega recuperación profesional para el Workspace: error boundary dedicado, loading skeleton, panel de recuperación para vistas guardadas inválidas, fallback cuando Supabase/RLS bloquea persistencia y acciones seguras para volver al Home del workspace, Proyectos o Dashboard clásico. No agrega migraciones ni cambia RLS.

Validación nueva:

```bash
npm run workspace:error-recovery:ready
npm run verify:current
```

## v58.27.1 — Release Candidate Fixes

Esta versión consolida toda la línea Workspace-First como release candidate para validación final de cliente. No agrega migraciones nuevas ni cambia RLS; cierra documentación, verificadores, checklist final y readiness de Workspace.

Validación nueva:

```bash
npm run workspace:release-candidate:ready
npm run verify:current
npm run build:preflight
npm run build
```

Incluye checklist final de Workspace, Supabase, Vercel, rutas clásicas, permisos, mobile, saved views, spaces, files, boards, command center, share panel y error recovery.

## v58.27.2 — Workspace Pro Design Reset + Enterprise UI System

- Reinicia la capa visual de `/app/workspace` con un sistema `ws-pro-*` más sobrio y profesional.
- Compacta sidebar, header, tabs, Home y panel derecho.
- Oculta ruido técnico del usuario final: health, migrations, RLS y debug quedan fuera del flujo normal.
- Mantiene datos, rutas, permisos, spaces, saved views, archivos, pizarras y validaciones existentes.
- Nuevo check: `npm run workspace:design-reset:ready`.



## v58.27.2.1 — Workspace Pro Layout Simplification + Interaction Cleanup

This patch tightens the Workspace Pro UI after the v58.27.2 design reset. It removes duplicated navigation, keeps views in the top tab bar, closes the inspector by default, moves heavy managers into overlay sheets, and makes Home/List/Board more compact and professional. No Supabase, RLS, migration, or dependency changes.

## v58.27.6 — Workspace Pro Deep Cleanup + 2026 UI Controls System

Patch release that aligns Workspace readiness scripts after the v58.27.2.1 layout cleanup. It updates version expectations in the Workspace doctor/readiness chain so local and Vercel preflight no longer fail by expecting v58.27.2. No Supabase, RLS, migration, dependency, or UI feature changes.

## v58.27.6 — Workspace Pro Deep Cleanup + 2026 UI Controls System

Workspace Pro ahora prioriza interacción real: Home clicable, vista Tareas con edición rápida, nueva vista Proyectos, creador Tarea/Proyecto, checklist opcional, Board con Producción/columnas visibles/Concluido oculto y drag/drop básico de estado.

Migración opcional requerida si se quieren guardar vistas tipo Proyectos:

```sql
0060_v58_27_3_project_views_projects_view_support.sql
```

## v58.27.6 — Workspace Pro Deep Cleanup + 2026 UI Controls System

Board Pro mejora la operación diaria con drag/drop real, columnas configurables, concluidas ocultas por defecto y edición contextual de tareas sin tocar Supabase/RLS ni migraciones.

## v58.27.6 — Workspace Pro Deep Cleanup + 2026 UI Controls System

Pulido de Archivos y Reportes en Workspace Pro: upload integrado, acciones de archivo, renombrado/eliminación segura, reportes configurables por rango/proyecto y readiness `workspace:files-reports:ready`.

## v58.27.6 — Workspace Pro Deep Cleanup + 2026 UI Controls System

- Depuración real de Workspace Pro sin tocar Supabase ni rutas clásicas.
- Command Center y Share Panel se montan bajo demanda.
- Filtro de estado convertido a `WorkspaceProFilterBar` con controles compactos.
- Render duplicado del panel derecho eliminado.
- Home vuelve a renderizar su vista real.
- Nuevo check: `npm run workspace:deep-cleanup:ready`.


## v58.27.7 — Workspace Pro Render Diet + Dead UI Removal

Render diet for Workspace Pro: central derived data helper, project task map, board column map, lighter Home/Inspector previews and new `workspace:render-diet:ready` check.


## v58.27.8 — Workspace Pro Visual Density + Final UI Polish

Esta versión toma como base v58.27.7.1 y aplica el polish visual final del Workspace Pro: mayor ancho útil, cards menos centradas, tabs compactas, dock derecho sticky, frames de 1440px y jerarquía visual más limpia. No agrega migraciones, dependencias ni cambios de Supabase.

Validación rápida:

```bash
npm run verify:current
npm run workspace:visual-density:ready
npm run workspace:render-diet:ready
npm run typecheck
npm run build:preflight
```
