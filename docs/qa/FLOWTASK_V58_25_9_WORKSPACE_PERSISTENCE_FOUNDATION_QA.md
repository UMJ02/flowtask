# QA — v58.25.9 Workspace Persistence Foundation

## Checklist

- [ ] Aplicar migración `0056_v58_25_9_workspace_persistence_foundation.sql` en Supabase correcto.
- [ ] Confirmar que `workspace_spaces` existe.
- [ ] Confirmar que `project_views` existe.
- [ ] Confirmar RLS habilitado en ambas tablas.
- [ ] Abrir `/app/workspace` sin filas persistidas y validar fallback de espacios generados.
- [ ] Insertar un `workspace_spaces` personal y validar que aparece en la sidebar.
- [ ] Insertar `project_views` para un proyecto y validar punto verde en la tab correspondiente.
- [ ] Cambiar espacio/proyecto y confirmar que no mezcla datos entre personal y organización.
- [ ] Validar que archivos, actividad, pizarras, lista, board, tabla y reportes siguen cargando.

## SQL diagnóstico

```sql
select to_regclass('public.workspace_spaces') as workspace_spaces,
       to_regclass('public.project_views') as project_views;

select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('workspace_spaces', 'project_views');
```
