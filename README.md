# FlowTask — V58.10.2 Deploy Pipeline Fix

Esta versión toma como base **V58.10** y corrige el pipeline de deploy/preflight sin tocar la UI recién trabajada en la pantalla de **Equipo**.

## Objetivo
- corregir el preflight de deploy sin alterar componentes de UI
- alinear versiones, readiness y verificación con la realidad de V58.10.2
- dejar compatibilidad clara con Vercel y desarrollo local
- mantener continuidad 1:1 sin romper flujo funcional

## Qué cambia en la V58.10.2
- metadata y scripts alineados a `V58.10.2`
- nuevo `scripts/verify-v58.10.2.mjs`
- nuevo release doc `docs/release/V58_10_1_DEPLOY_PIPELINE_FIX.md`
- `.env.example`, `.nvmrc` y `.github/workflows/ci.yml` agregados
- `check-node-version.mjs` ajustado para permitir Node 22 local sin bloquear deploy en Node 20
- `build-deploy-readiness.mjs` corregido para aceptar `npm ci` o `npm install` y validar V58.10.2
- `deploy-production-readiness.mjs` alineado a V58.10.2 y al pipeline actual de Vercel

## Scripts principales
- `npm run verify:v58.10.2`
- `npm run verify:current`
- `npm run release:repo:current`

## Base de continuidad
Usa esta **V58.10.2** como base para seguir con cambios funcionales o nuevos ajustes UX/UI sin reabrir problemas del pipeline de deploy.
