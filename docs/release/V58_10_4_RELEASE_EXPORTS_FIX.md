# FlowTask — V58.10.4 Release Exports Fix

Base aplicada sobre V58.10.2 con integración de cambios de V58.10.3 y V58.10.4.

## Objetivo
Corregir exports de release que seguían siendo consumidos por endpoints y layout para eliminar errores de typecheck/build sin tocar la UI.

## Cambios aplicados
- versión viva actualizada a `58.10.4-release-exports-fix`
- `src/lib/release/version.ts` corregido con `APP_VERSION`, `APP_RELEASE_NAME` y `APP_RELEASE_STAGE`
- `package.json` alineado a V58.10.4
- `verify:current` alineado a V58.10.4
- nuevo `scripts/verify-v58.10.4.mjs`
- `build-deploy-readiness.mjs` alineado a V58.10.4
- `deploy-production-readiness.mjs` alineado a V58.10.4
- `README.md` actualizado
- continuidad conservada de V58.10.3: verify alineado y sin dependencia obligatoria de `.github/workflows/ci.yml`
