# FlowTask v58.21.1 — QA de lenguaje e interacción

## Pantallas críticas
- /app/tasks/new
- /app/projects/new
- /app/projects/[id]
- /app/projects/[id]?mode=edit
- /app/projects/[id]/edit

## Checklist
- Los mensajes no usan “inline”, “workspace”, “deadline”, “contrato Supabase” ni lenguaje interno en zonas visibles principales.
- La tarea nueva conserva los campos reales y no promete guardar “próximo check-in”.
- Crear proyecto conserva imagen, estado, departamento, registro, país, fecha límite y colaboración.
- El detalle de proyecto no muestra prioridad fija.
- Las tabs de proyecto no duplican Planificación ni muestran Builder.
- Guardar inline en proyecto muestra confirmación clara.
- Errores de sesión/permisos indican una acción de recuperación.
