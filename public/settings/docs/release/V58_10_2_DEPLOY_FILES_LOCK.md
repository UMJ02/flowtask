# V58.10.2 — Deploy Files Lock

Base: V58.10.1

Objetivo:
- asegurar que los archivos requeridos por el pipeline de deploy estén ubicados en su lugar correcto en la raíz del repo
- mantener intacta la UI de Equipo trabajada en V58.10

Archivos obligatorios del pipeline:
- `.nvmrc` → raíz del proyecto
- `.env.example` → raíz del proyecto
- `.github/workflows/ci.yml` → `.github/workflows/ci.yml`

Ajustes incluidos:
- versión actualizada a `58.10.2-deploy-files-lock`
- nuevo `scripts/verify-v58.10.2.mjs`
- scripts de readiness alineados a `V58.10.2`
- `.gitignore` mantiene permitidos estos archivos críticos

Validación esperada:
- `npm run verify:current`
- `npm run deploy:readiness`
- `npm run deploy:production:ready`
