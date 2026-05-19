# v58.28.21.3 — Classic Reports Data Integrity + Checklist Progress Export

Esta versión corrige la integridad de datos en la reportería clásica, landing compartida y exportación Excel.

## Cambios
- Último comentario real se carga por lote para todas las tareas exportables.
- Progreso por checklist se calcula por lote desde `task_checklist_items`.
- `SharedReportTaskItem` incluye `progressPercent`, `checklistDone` y `checklistTotal`.
- Excel agrega columnas `Avance %` y `Checklist`.
- Landing pública muestra avance y checklist por tarea.
- Analytics agrega `averageTaskProgress` y `tasksWithChecklist`.
- Labels de estado se alinean con los estados finales de FlowTask.

## Sin cambios
No toca Supabase, RLS, migraciones, dependencias ni layout visual general.
