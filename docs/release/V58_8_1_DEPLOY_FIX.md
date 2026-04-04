# FlowTask — V58.8.1 Deploy Fix

Base: **V58.8**

## Objetivo
Corregir el pipeline de deploy real en Vercel sin tocar la lógica funcional cerrada en V58.8.

## Ajustes aplicados
- `package.json` actualizado a `58.8.1-deploy-fix`
- `engines.node` fijado a `20.x`
- `.nvmrc` normalizado a `20`
- nuevo `scripts/verify-v58.8.1.mjs`
- `verify:current` y `release:repo:current` alineados a V58.8.1
- `build-deploy-readiness.mjs` corregido para validar V58.8.1 y aceptar `npm ci` como `installCommand`
- `deploy-production-readiness.mjs` alineado a V58.8.1

## Resultado esperado
- `npm run verify:current` debe resolver V58.8.1
- `npm run deploy:readiness` no debe fallar por referencias antiguas a V58.4
- `npm run vercel:build` queda listo para entorno Node 20.x en Vercel
