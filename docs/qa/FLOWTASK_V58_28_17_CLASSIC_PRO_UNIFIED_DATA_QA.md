# FlowTask v58.28.17 — Classic + Pro Unified Data QA

## Objetivo
Validar que Clásico y Workspace Pro usen la misma información operativa para tareas antes de avanzar a una versión candidata de cliente final.

## Estados finales de usuario
- Pendiente (`pendiente`)
- En curso (`en_proceso`)
- Producción (`produccion`)
- En espera (`en_espera`)
- Revisión (`revision`)
- Concluido (`concluido`)

El valor interno `en_proceso` debe mostrarse como **En curso** en todas las superficies de usuario.

## Checklist manual obligatorio

### Clásico → Pro
1. En `/app/tasks`, editar una tarea y cambiar estado, prioridad y fecha.
2. Abrir `/app/workspace?view=board`.
3. Confirmar que la tarea aparece en la columna correcta y con fecha/prioridad actualizadas.

### Pro → Clásico
1. En `/app/workspace?view=board`, abrir acciones de una tarjeta.
2. Cambiar estado a Pendiente, Revisión y En curso.
3. Abrir `/app/tasks` y el kanban clásico.
4. Confirmar que los cambios persisten y que no hay estados viejos por overrides.

### Proyecto → Tareas
1. Entrar al detalle de un proyecto.
2. Editar una tarea anidada.
3. Confirmar que Lista clásica, Board clásico y Workspace Pro muestran el mismo estado final.

### Concluidas
1. Marcar una tarea como Concluido.
2. Confirmar que las vistas operativas no se saturan con concluidas.
3. Activar vista/columna de concluidas cuando corresponda y confirmar que aparece.

## SQL recomendado

```sql
select conname, pg_get_constraintdef(oid)
from pg_constraint
where conrelid = 'public.tasks'::regclass
and conname = 'tasks_status_check';
```

Debe incluir: `pendiente`, `en_proceso`, `produccion`, `en_espera`, `revision`, `concluido`.

```sql
select status, count(*)
from public.tasks
where deleted_at is null
group by status
order by status;
```

No deberían aparecer estados fuera del set final.
