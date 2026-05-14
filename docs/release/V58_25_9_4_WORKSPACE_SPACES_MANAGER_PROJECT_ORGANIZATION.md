# v58.25.9.4 — Workspace Spaces Manager + Project Organization

## Objetivo
Convertir `workspace_spaces` en una experiencia real desde `/app/workspace`: crear espacios persistidos, editarlos, archivarlos y asignar proyectos reales a un espacio principal sin romper rutas clásicas.

## Cambios principales
- Nueva migración opcional `0057_v58_25_9_4_workspace_space_project_assignments.sql`.
- Nueva tabla `workspace_space_projects` para asignar proyectos a espacios.
- RLS para lectura/escritura basada en `workspace_spaces`, `projects`, roles de proyecto y admins/managers de organización.
- Nuevo tipo `WorkspaceProjectSpaceAssignment`.
- Nuevo helper `getWorkspaceProjectSpaceAssignments()`.
- `/app/workspace` usa asignaciones reales para filtrar proyectos/tareas en espacios persistidos.
- Nuevo componente `WorkspaceSpacesManager`.
- Nueva acción “Espacios” en la action bar del Workspace.
- Sidebar mantiene espacios guardados + espacios generados como fallback.
- CSS nuevo para manager, cards, inputs, acciones y pills de proyectos.

## No se reemplaza
- No se reemplaza `/app/tasks`.
- No se reemplaza `/app/projects`.
- No se reemplaza `/app/boards`.
- No se reemplaza `/app/reports`.
- No se duplica `BoardPage`.
- No se toca `safe_delete_visual_board`.
- No se agregan dependencias nuevas.

## Supabase
Aplicar después de `0056`:

```sql
-- supabase/migrations/0057_v58_25_9_4_workspace_space_project_assignments.sql
```

Validación mínima:

```sql
select
  to_regclass('public.workspace_spaces') as workspace_spaces,
  to_regclass('public.project_views') as project_views,
  to_regclass('public.workspace_space_projects') as workspace_space_projects;
```

## QA resumido
- Crear espacio personal.
- Crear espacio en organización como admin/manager.
- Renombrar espacio.
- Archivar espacio.
- Asignar proyecto a espacio.
- Quitar proyecto de espacio.
- Validar que sidebar filtre proyectos reales por espacio.
- Validar que tareas del espacio vienen de proyectos asignados.
- Validar fallback si `workspace_space_projects` no existe todavía.
