# QA — v58.25.9.1 Workspace Persistence UI + Saved Views Manager

## CLI
```bash
npm run verify:current
npm run typecheck
npm run build:preflight
npm run build
```

## Checklist funcional
- [ ] `/app/workspace` carga sin romper shell full-screen.
- [ ] El botón `Vistas guardadas` abre/cierra el manager.
- [ ] Sin `projectId`, el manager bloquea guardado y muestra mensaje profesional.
- [ ] Con `projectId`, permite guardar vista actual en `project_views`.
- [ ] Las vistas guardadas aparecen como cards.
- [ ] Renombrar actualiza el título.
- [ ] Abrir cambia `?view=` sin perder contexto.
- [ ] Default actualiza `is_default` por tipo de vista.
- [ ] Eliminar borra la vista guardada.
- [ ] No hay `alert`, `confirm` ni navegación pesada.

## Supabase
Requiere haber aplicado previamente:
```sql
0056_v58_25_9_workspace_persistence_foundation.sql
```
