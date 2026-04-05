# FlowTask — V58.10.4 Release Exports Fix

Esta versión toma como base **V58.10** y corrige el pipeline de deploy/preflight sin tocar la UI recién trabajada en la pantalla de **Equipo**.

## Objetivo
- consolidar los ajustes de deploy/readiness iniciados en V58.10.3
- corregir exports de release para que typecheck y build no fallen
- mantener intacta la UI recién trabajada
- dejar continuidad limpia sobre la base V58.10.4

## Qué cambia en la V58.10.4
- metadata y scripts alineados a `V58.10.4`
- nuevo `scripts/verify-v58.10.3.mjs
- nuevo `scripts/verify-v58.10.4.mjs``
- nuevo release doc `docs/release/V58_10_1_DEPLOY_PIPELINE_FIX.md`
- `.env.example`, `.nvmrc` y `.github/workflows/ci.yml` agregados
- `check-node-version.mjs` ajustado para permitir Node 22 local sin bloquear deploy en Node 20
- `build-deploy-readiness.mjs` corregido para aceptar `npm ci` o `npm install` y validar V58.10.4
- `deploy-production-readiness.mjs` alineado a V58.10.4 y al pipeline actual de Vercel

## Scripts principales
- `npm run verify:v58.10.2`
- `npm run verify:current`
- `npm run release:repo:current`

## Base de continuidad
Usa esta **V58.10.4** como base para seguir con cambios funcionales o nuevos ajustes UX/UI sin reabrir problemas del pipeline de deploy.


## Continuidad técnica incorporada
- cambios de V58.10.3 integrados: verify alineado, sin dependencia obligatoria de `.github/workflows/ci.yml`, `.nvmrc` y `.env.example` como obligatorios
- cambios de V58.10.4 integrados: `APP_VERSION`, `APP_RELEASE_NAME` y `APP_RELEASE_STAGE` restaurados y alineados
