# QA — v58.25.9.5 Workspace Project Home Dashboard

## Checklist funcional

- [ ] Abrir `/app/workspace` sin parámetros y confirmar que carga la vista Home.
- [ ] Abrir `/app/workspace?view=home` y confirmar que no cambia de página completa.
- [ ] Abrir `/app/workspace?projectId=ID&view=home` con un proyecto real.
- [ ] Confirmar que el Home muestra progreso real de tareas.
- [ ] Confirmar que tareas importantes se alimentan de `priority = alta`.
- [ ] Confirmar que próximos vencimientos usan fechas reales.
- [ ] Confirmar que pizarras conectadas aparecen si tienen `project_id` del proyecto activo.
- [ ] Confirmar que archivos recientes aparecen desde el contexto activo.
- [ ] Confirmar que actividad reciente aparece sin romper si no hay logs.
- [ ] Confirmar estados vacíos profesionales para proyecto sin tareas, sin archivos, sin pizarras y sin vistas guardadas.
- [ ] Guardar una vista Home desde Saved Views Manager.
- [ ] Abrir una vista Home guardada con `savedViewId`.
- [ ] Confirmar que el sidebar muestra `Home del proyecto`.
- [ ] Confirmar que las tabs superiores muestran `Home`.

## Checklist Supabase

- [ ] Aplicar `0058_v58_25_9_5_project_views_home_view_support.sql`.
- [ ] Confirmar que `project_views.view_type` acepta `home`.
- [ ] Confirmar que las policies existentes de `project_views` siguen funcionando.
- [ ] Confirmar que no se modifica `workspace_spaces` ni `workspace_space_projects`.

## SQL sugerido

```sql
select conname, pg_get_constraintdef(oid)
from pg_constraint
where conrelid = 'public.project_views'::regclass
  and conname = 'project_views_view_type_check';
```

Debe incluir:

```txt
home, list, board, timeline, table, canvas, files, reports
```

## Checklist responsive

- [ ] Home en desktop 2XL con panel derecho visible.
- [ ] Home en tablet con cards fluidas.
- [ ] Home en mobile con hero de una columna.
- [ ] Accesos rápidos no se desbordan.
- [ ] Métricas se apilan correctamente.
