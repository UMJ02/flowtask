# FlowTask V10 — Ops Runbook

## Rutina mínima antes de deploy
1. `npm run clean`
2. `npm run ci:full`
3. `npm run preflight:report`

## Rutina mínima después de deploy
1. `npm run smoke:health`
2. `npm run readiness:report`
3. `npm run postdeploy:verify`

## Comando consolidado
- `npm run release:ops`

## Objetivo
Asegurar que el paquete conserve las piezas mínimas de release y que la ruta de health siga presente.
