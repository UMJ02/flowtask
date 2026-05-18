# v58.28.17 — Classic + Pro Unified Data QA + Final User Flow

Esta versión refuerza la convivencia entre la experiencia clásica y Workspace Pro antes de entrar a copy final/mobile final.

## Cambios
- Workspace Pro mantiene un estado local sincronizado (`syncedTasks`) a partir de eventos `flowtask:task-updated`.
- Workspace clásico escucha el mismo evento para actualizar tareas sin depender solo de recargas completas.
- `mergeTaskUpdate` normaliza aliases `due_date/dueDate`, `project_id/projectId` y `client_name/clientName`.
- Superficies clásicas y Pro usan los mismos labels finales de estados.
- El estado interno `en_proceso` se presenta como **En curso**.
- El checklist QA de datos unificados queda documentado.

## Sin cambios
- No se tocaron RLS.
- No se tocaron migraciones.
- No se cambió `safe_delete_visual_board`.
- No se agregaron dependencias.
