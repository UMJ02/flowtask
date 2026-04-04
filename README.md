# FlowTask — V58.7 Deploy + Producción Real

Esta versión toma como base **V58.6** y cierra la capa operativa para despliegue real, validación postdeploy y handoff técnico sin reabrir la arquitectura existente.

## Objetivo
- dejar el repo listo para despliegue técnico reproducible
- endurecer el flujo de preflight, deploy y postdeploy
- documentar la corrida operativa mínima para Vercel/producción
- mantener estable la base funcional y de board ya cerrada en V58.6

## Qué cambia en la V58.7
- metadata y scripts alineados a `V58.7`
- nueva verificación `scripts/verify-v58.7.mjs`
- nuevo chequeo `scripts/deploy-production-readiness.mjs`
- nuevo smoke postdeploy `scripts/postdeploy-smoke.mjs`
- `production-gate` y `deploy-summary` corregidos a la línea viva `V58.x`
- `vercel.json` reforzado con headers y build reproducible
- se agrega workflow base `.github/workflows/ci.yml`
- documentación de release y runbook operativo actualizada a `V58.7`

## Scripts principales
- `npm run verify:v58.7`
- `npm run deploy:production:ready`
- `npm run postdeploy:smoke`
- `npm run verify:current`
- `npm run release:repo:current`

## Base de continuidad
Usa esta **V58.7** como nueva base 1:1 para deploy final, QA postdeploy y bundle cliente listo para producción.
