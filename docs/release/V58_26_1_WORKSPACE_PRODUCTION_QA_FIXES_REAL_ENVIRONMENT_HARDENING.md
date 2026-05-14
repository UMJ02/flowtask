# FlowTask v58.26.1 — Workspace Production QA Fixes + Real Environment Hardening

## Objetivo

Cerrar la primera ronda post-readiness de Workspace-First con ajustes pensados para entorno real: Supabase aplicado parcialmente, migraciones repetidas, triggers ya existentes, validación local con Node 20 y checks de producción más estrictos.

## Cambios principales

- Se agrega la migración `0059_v58_26_1_workspace_real_environment_hardening.sql`.
- Se endurece la idempotencia de la migración `0056` agregando `drop trigger if exists` antes de recrear triggers.
- Se agrega `workspace:real-env:ready` para validar que los parches de entorno real existen.
- `build:preflight` ahora incluye `workspace:real-env:ready`.
- `verify:current` apunta a `verify:v58.26.1`.
- Se actualiza versión de release a `58.26.1-workspace-production-qa-fixes-real-environment-hardening`.
- Se agregan checklists específicos para Supabase real.

## Migración 0059

La migración 0059 no elimina datos. Su función es reparar o reafirmar elementos críticos:

- `workspace_spaces_set_updated_at`
- `project_views_set_updated_at`
- `workspace_space_projects_set_updated_at`
- RLS habilitado en las tres tablas de persistencia Workspace
- constraint `project_views_view_type_check` con soporte para `home`

## Regla de aplicación

Aplicar después de:

1. `0056_v58_25_9_workspace_persistence_foundation.sql`
2. `0057_v58_25_9_4_workspace_space_project_assignments.sql`
3. `0058_v58_25_9_5_project_views_home_view_support.sql`
4. `0059_v58_26_1_workspace_real_environment_hardening.sql`

## Validación local recomendada

```bash
cd ~/Documents/"Web Projects"/flowtask
nvm use 20
npm install
npm run workspace:doctor
npm run workspace:production:ready
npm run workspace:real-env:ready
npm run verify:current
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```

## Resultado esperado

Workspace debe seguir funcionando aunque Supabase haya tenido migraciones aplicadas parcialmente antes. Los triggers se recrean de forma segura y los checks detectan si falta la capa de real environment hardening.
