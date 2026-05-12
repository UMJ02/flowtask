# QA — v58.22.3 Workspace Board Column Visibility

## CLI

- `npm run verify:v58.22.3`
- `npm run typecheck`
- `npm run build:preflight`
- `npm run build`
- `npm run dev`

## Workspace

1. Abrir la vista donde aparece **Mi flujo de trabajo**.
2. Confirmar que existe el botón **Columnas** junto a Filtros / Agrupar / Nueva tarea.
3. Abrir el selector.
4. Ocultar **En espera** y confirmar que la columna desaparece.
5. Ocultar **Producción** y confirmar que desaparece.
6. Volver a activar columnas y confirmar que aparecen en el orden correcto.
7. Confirmar que no permite ocultar la última columna visible.
8. Recargar la página y confirmar que la selección se mantiene.
9. Verificar que `/app/tasks` no cambió su comportamiento por esta función.

## Supabase

1. Ejecutar la migración `0044_v58_22_2_task_status_production.sql` en una base sin `public.task_statuses`.
2. Confirmar que no falla.
3. Confirmar que `tasks_status_check` incluye `produccion`.
