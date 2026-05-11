# v58.24.9 — Workspace Data Isolation + Organization Lifecycle Hardening

**Base:** v58.24.8.4 — Boards Create RLS Diagnostics + Workspace Scope Hardening

## Objetivo

Alinear la base de datos con el modelo final de FlowTask:

- El usuario individual es la identidad principal.
- El workspace personal vive separado de cualquier organización.
- Una organización es un ecosistema independiente creado por un usuario.
- Personal y organización no deben mezclar tareas, proyectos, clientes ni pizarras.
- La migración personal → organización debe ser explícita.
- La eliminación de organización debe ser recuperable antes de una purga final controlada.

## Cambios incluidos

### SQL / DB

Se agrega:

- `supabase/migrations/0051_v58_24_9_workspace_data_isolation_org_lifecycle.sql`

Incluye:

- Helper `is_organization_member()`.
- Policies reforzadas para `projects`.
- Policies reforzadas para `tasks`.
- `schedule_organization_deletion()`.
- `restore_organization()`.
- `purge_organization_data()`.
- `purge_expired_organizations()`.
- `move_personal_project_to_organization()`.

### Documentación

Se agrega:

- `docs/architecture/FLOWTASK_WORKSPACE_DATA_ISOLATION_MODEL.md`
- `docs/qa/FLOWTASK_V58_24_9_WORKSPACE_DATA_ISOLATION_ORGANIZATION_LIFECYCLE_HARDENING_QA.md`

## Lo que NO cambia

- No se toca UI visual.
- No se toca el editor de Boards.
- No se cambia Supabase Storage.
- No se ejecuta automáticamente ninguna purga.
- No se migra data automáticamente.

## Validación recomendada

```bash
npm install
npm run verify:v58.24.9
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```

## QA principal

- Crear datos personales y confirmar `organization_id is null`.
- Crear datos en organización y confirmar `organization_id = org.id`.
- Confirmar que vistas personales no muestran datos de organización.
- Confirmar que vistas de organización no muestran datos personales.
- Probar `schedule_organization_deletion`.
- Probar `restore_organization`.
- Probar `move_personal_project_to_organization`.
- Probar `purge_organization_data` solo en un entorno de staging o con data temporal.
