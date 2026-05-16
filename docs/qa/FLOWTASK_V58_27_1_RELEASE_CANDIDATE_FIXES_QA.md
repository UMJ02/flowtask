# FlowTask v58.27.1 — Release Candidate Fixes QA

## Checklist QA

- `/app/workspace` carga sin romper el shell full-screen.
- Home, Lista, Board, Timeline, Tabla, Canvas, Archivos y Reportes siguen disponibles.
- Command Center abre con Ctrl/Cmd+K.
- Share Panel permite copiar links internos sin saltarse RLS.
- Saved Views mantiene filtros/defaults.
- Spaces Manager mantiene asignaciones de proyectos.
- Error Recovery muestra acciones seguras.
- Rutas clásicas siguen vivas: `/app/tasks`, `/app/projects`, `/app/boards`, `/app/reports`.
- Supabase mantiene `workspace_spaces`, `project_views`, `workspace_space_projects` y `safe_delete_visual_board`.
