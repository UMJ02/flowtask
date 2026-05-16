# Checklist final — FlowTask v58.27.0

## Supabase
- `workspace_spaces` existe.
- `project_views` existe.
- `workspace_space_projects` existe.
- `visual_boards` existe.
- `safe_delete_visual_board(uuid)` existe.
- RLS activo en tablas Workspace.
- Triggers `updated_at` activos.
- `project_views_view_type_check` acepta `home`.
- Policies permiten lectura/escritura según owner/editor/admin/manager.

## Rutas obligatorias vivas
- `/app/workspace`
- `/app/tasks`
- `/app/projects`
- `/app/projects/[id]`
- `/app/boards`
- `/app/reports`
- `/app/notifications`
- `/app/settings`

## Workspace-First
- Sidebar muestra espacios y proyectos.
- Header contextual muestra workspace/proyecto.
- Home muestra progreso, tareas, archivos, pizarras y actividad.
- Lista, Board, Timeline, Tabla, Canvas, Archivos y Reportes cargan sin romper.
- Command Center busca tareas, proyectos, espacios, vistas, pizarras y archivos.
- Share panel copia links internos.
- Error recovery permite reintentar o volver al Home.

## Producción
- Node 20 activo.
- `.env` real configurado.
- Variables Supabase pertenecen al mismo project ref.
- `npm run build:preflight` pasa.
- `npm run build` pasa.
- Vercel usa `npm run vercel:build`.
