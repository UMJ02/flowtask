# v58.28.21 — Supabase / RLS / Client Readiness Final

Versión enfocada en preparar FlowTask para cliente final desde la capa de datos: Supabase, RLS, variables, migraciones y QA real entre workspace personal y organización.

## Incluye
- Check `workspace:supabase-client-readiness:ready`.
- SQL de validación en `docs/sql/V58_28_21_SUPABASE_RLS_CLIENT_READINESS.sql`.
- QA manual en `docs/qa/FLOWTASK_V58_28_21_SUPABASE_RLS_CLIENT_READINESS_QA.md`.
- Versionado v58.28.21 alineado en package, lockfile y release metadata.
- Validación de migraciones críticas: estados, workspace isolation, workspace spaces, space projects y project views.

## No incluye
- Cambios visuales.
- Cambios en Supabase schema adicionales.
- Cambios de RLS ejecutados automáticamente.
- Dependencias nuevas.
