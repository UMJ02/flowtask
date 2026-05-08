# v58.21.0 — Create Flow Refresh + Project Inline Activation

Base: v58.20.1 Task Workspace Visual Polish + Interaction QA.

## Alcance

- Rediseño visual de `/app/tasks/new` conservando los campos reales del formulario y sin agregar campos decorativos a Supabase.
- Rediseño visual de `/app/projects/new` conservando nombre, descripción, imagen, estado, departamento, registro, país, deadline y colaborativo.
- Activación de edición inline en `/app/projects/[id]?mode=edit` sin reemplazar la estructura operativa del detalle de proyecto.
- Redirect de `/app/projects/[id]/edit` hacia la misma vista con `mode=edit`.
- `projectEditRoute` apunta al modo inline para mantener una experiencia fluida.

## Contratos protegidos

No se agregan columnas nuevas. Se mantienen los contratos de `tasks`, `projects`, `project_members`, `activity_logs`, registros/clientes, departamentos, países y storage `attachments`.

## QA recomendado

```bash
npm run verify:v58.21.0
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
