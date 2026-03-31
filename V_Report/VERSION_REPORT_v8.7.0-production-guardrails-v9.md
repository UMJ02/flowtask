# FlowTask V9 — Production Guardrails v9

## Base
Esta versión parte de la V8 full completa.

## Objetivo
Agregar guardrails operativos para reducir riesgo antes de deploy y dejar una base más seria para QA final y producción.

## Cambios aplicados
- `package.json` actualizado a `8.7.0-production-guardrails-v9`
- nuevo script `validate:node`
- nuevo script `preflight:report`
- nuevo script `ci:full`
- nuevo script `deploy:gate`
- agregado `scripts/check-node-version.mjs`
- agregado `scripts/preflight-report.mjs`
- agregado workflow `.github/workflows/ci.yml`
- agregado endpoint `src/app/api/health/route.ts`
- `README.md` ampliado para cubrir preflight, CI y smoke test post-deploy

## Resultado esperado
- validación más consistente del entorno local y CI
- endpoint simple para revisar salud básica después del deploy
- mejor handoff para pruebas finales

## Nota
Esta versión mantiene la línea de trabajo 1:1 y no elimina el source previo; añade una capa operativa encima de la V8.
