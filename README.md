# FlowTask — v58.24.9 Workspace Data Isolation + Organization Lifecycle Hardening

Base: **v58.24.8.4 — Boards Create RLS Diagnostics + Workspace Scope Hardening**

## Objetivo

Dejar más alineada la base técnica con el modelo correcto de FlowTask:

- Usuario individual como identidad principal.
- Workspace personal separado de organizaciones.
- Organizaciones como ecosistemas independientes.
- Migración personal → organización explícita.
- Borrado de organización con periodo de recuperación.
- Purga final controlada de data relacionada.

## Cambios principales

Se agrega:

- `supabase/migrations/0051_v58_24_9_workspace_data_isolation_org_lifecycle.sql`
- `docs/architecture/FLOWTASK_WORKSPACE_DATA_ISOLATION_MODEL.md`
- `docs/release/V58_24_9_WORKSPACE_DATA_ISOLATION_ORGANIZATION_LIFECYCLE_HARDENING.md`
- `docs/qa/FLOWTASK_V58_24_9_WORKSPACE_DATA_ISOLATION_ORGANIZATION_LIFECYCLE_HARDENING_QA.md`

## Funciones SQL agregadas

- `is_organization_member()`
- `schedule_organization_deletion()`
- `restore_organization()`
- `purge_organization_data()`
- `purge_expired_organizations()`
- `move_personal_project_to_organization()`

## Validación recomendada

```bash
npm install
npm run verify:v58.24.9
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```

## Nota importante

Esta versión agrega hardening y documentación SQL. No ejecuta purgas automáticamente y no migra data existente por sí sola.
