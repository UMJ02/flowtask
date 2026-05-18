# Auditoría v58.28.17 — Classic + Pro Unified Data QA

## Hallazgos corregidos
- Algunas superficies seguían mostrando `En proceso`, `Hecho` o `Completada` para tareas.
- Workspace Pro recibía eventos locales solo en Board; ahora el shell central mantiene `syncedTasks`.
- El merge de eventos podía traer `due_date` desde Supabase sin actualizar `dueDate` usado por Workspace Pro.
- Workspace clásico no escuchaba el evento `flowtask:task-updated` en la pantalla principal.

## Regla final
`tasks.status`, `tasks.priority`, `tasks.due_date`, `tasks.project_id` y `tasks.title` son la fuente de verdad. Las vistas pueden optimizar visualmente, pero deben sincronizar con el evento local y con Supabase.
