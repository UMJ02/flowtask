# FlowTask — V58.10.3 Verify Alignment Fix

Base aplicada sobre V58.10.2.

## Objetivo
Corregir el preflight/verify para que deje de arrastrar referencias a verificadores viejos y para quitar la dependencia obligatoria de `.github/workflows/ci.yml`.

## Cambios
- versión viva intermedia alineada a `58.10.3-verify-alignment-fix`
- `verify:current` alineado a V58.10.3
- nuevo `scripts/verify-v58.10.3.mjs`
- `package.json` corregido para que no apunte al verify viejo
- `build-deploy-readiness.mjs` alineado a V58.10.3
- `deploy-production-readiness.mjs` alineado a V58.10.3
- se quitó la dependencia obligatoria de `.github/workflows/ci.yml`
- se mantienen obligatorios `.nvmrc` y `.env.example`
- `README.md` actualizado
- `REQUIRED_DEPLOY_FILES_LOCATION.md` actualizado
