# QA — v58.25.9.3 Workspace Saved Views Defaults + Filters Persistence

## Checklist funcional

1. Abrir `/app/workspace?projectId=<id>`.
2. Cambiar a `Board`.
3. Aplicar filtro de estado.
4. Cambiar agrupación.
5. Cambiar orden.
6. Guardar vista.
7. Confirmar que la tarjeta de vista guardada muestra estado, grupo y orden.
8. Abrir la vista guardada.
9. Confirmar que la URL incluye `savedViewId` y que se aplican filtros.
10. Marcar la vista como predeterminada.
11. Refrescar `/app/workspace?projectId=<id>` sin `view`.
12. Confirmar que la vista predeterminada se aplica automáticamente.
13. Cambiar filtro manualmente y confirmar que `savedViewId` desaparece.
14. Renombrar vista.
15. Eliminar vista.

## Checklist Supabase

- `project_views` debe existir.
- RLS debe permitir escribir a owners/editors/admins.
- `config` debe guardar `filters.status`, `filters.groupBy`, `filters.sort`, `filters.columns`.
- No debe crearse migración nueva para esta versión.

## Casos borde

- Proyecto sin vistas guardadas.
- Proyecto con varias vistas del mismo tipo.
- Vista default por tipo.
- Vista default inexistente o eliminada.
- Cambio manual de filtros luego de abrir una vista guardada.
- Usuario sin permisos de escritura debe recibir feedback, no romper UI.
