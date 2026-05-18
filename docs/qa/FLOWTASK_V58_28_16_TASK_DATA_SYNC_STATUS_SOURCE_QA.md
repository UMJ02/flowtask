# QA — v58.28.16 Task Data Sync + Status Source of Truth

## CLI

```bash
npm run verify:current
npm run workspace:task-sync:ready
npm run build:preflight
npm run vercel:build
```

## QA funcional

1. Crear una tarea en Clásico y confirmar que aparece en Workspace Pro.
2. Cambiar estado en lista clásica y confirmar que el Board clásico se actualiza.
3. Cambiar estado en Workspace Pro Board y confirmar que Clásico muestra el mismo estado.
4. Cambiar prioridad en Workspace Pro y confirmar que Clásico refleja la prioridad.
5. Cambiar fecha en edición clásica y confirmar que Workspace Pro refleja la fecha después del refresh/navegación.
6. Validar columnas del kanban clásico: Pendiente, En proceso, Producción, En espera, Revisión, Concluido.
7. Confirmar que `kanbanStatusOverrides` ya no se usa para pintar estado.

## Supabase

Ejecutar:

```sql
select conname, pg_get_constraintdef(oid)
from pg_constraint
where conrelid = 'public.tasks'::regclass
and conname = 'tasks_status_check';
```

Debe incluir `pendiente` y `revision`.
