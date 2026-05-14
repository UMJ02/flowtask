# QA — FlowTask v58.26.0 Workspace Production Readiness

## Validación CLI

```bash
npm run workspace:doctor
npm run workspace:production:ready
npm run verify:current
npm run typecheck
npm run build:preflight
npm run build
```

## Validación Supabase

```sql
select
  to_regclass('public.workspace_spaces') as workspace_spaces,
  to_regclass('public.project_views') as project_views,
  to_regclass('public.workspace_space_projects') as workspace_space_projects;
```

```sql
select
  relname as table_name,
  relrowsecurity as rls_enabled
from pg_class
where relname in ('workspace_spaces', 'project_views', 'workspace_space_projects');
```

```sql
select conname, pg_get_constraintdef(oid)
from pg_constraint
where conrelid = 'public.project_views'::regclass
  and conname = 'project_views_view_type_check';
```

## QA Workspace personal
- Abrir `/app/workspace`.
- Confirmar Home por defecto.
- Cambiar a Lista, Board, Timeline, Tabla, Canvas, Archivos y Reportes.
- Crear tarea inline.
- Editar estado/prioridad/fecha desde Lista o Tabla.
- Guardar vista.
- Renombrar vista.
- Marcar vista default.
- Crear espacio.
- Asignar proyecto a espacio.
- Usar Command Center con `⌘K`.

## QA Organización
- Cambiar a workspace de organización.
- Confirmar que no se mezclen datos personales.
- Confirmar que miembros puedan leer espacios/vistas según RLS.
- Confirmar que solo roles con permisos puedan escribir.
- Validar estados de solo lectura.

## QA Archivos y Pizarras
- Abrir Canvas.
- Confirmar pizarras reales.
- Abrir una pizarra existente.
- Confirmar que no se duplicó BoardPage.
- Abrir Archivos.
- Subir archivo si hay permiso.
- Confirmar que actividad se actualice.

## QA estados vacíos
- Proyecto sin tareas.
- Proyecto sin pizarras.
- Proyecto sin archivos.
- Espacio sin proyectos.
- Workspace sin espacios.
- Usuario sin permisos de escritura.
- Migración faltante o parcial.

## QA rutas clásicas
- `/app/tasks`
- `/app/projects`
- `/app/boards`
- `/app/reports`

Estas rutas deben seguir funcionando. Workspace no reemplaza todavía esas páginas.
