# v58.22.2 — Task Status Production + Attachment List + Inline Department Edit

Base: v58.22.1 Full Semantic Migration + Motion Experience Layer.

## Cambios

- Agrega el estado de tarea `produccion` con label visible **Producción**.
- Actualiza constantes, validación, tipos, badges, acciones inline, kanban y tareas internas de proyecto para reconocer Producción.
- Agrega migración Supabase `0044_v58_22_2_task_status_production.sql` para permitir el nuevo estado en `tasks.status` y registrarlo en `task_statuses`.
- Cambia la sección principal de adjuntos de tareas a lista compacta con icono, nombre, peso, fecha y acciones.
- Mantiene el preview lateral de adjuntos como miniaturas compactas.
- Permite editar el departamento en el inline de tareas y guardar `department_id`.

## Sin cambios

- No cambia RLS.
- No cambia Supabase Storage.
- No cambia contratos de proyectos.
- No cambia permisos ni autenticación.
