# FlowTask V10 — Ops Readiness

## Versión
8.8.0-ops-readiness-v10

## Base
Generada sobre V9 completa.

## Cambios principales
- package.json actualizado a `8.8.0-ops-readiness-v10`
- scripts nuevos:
  - `smoke:health`
  - `readiness:report`
  - `postdeploy:verify`
  - `release:ops`
- archivo nuevo: `scripts/smoke-health.mjs`
- archivo nuevo: `scripts/deploy-summary.mjs`
- README ampliado con rutina operativa post-deploy

## Intención
Agregar una capa operativa ligera para verificación post-deploy y lectura rápida de readiness sin depender de pasos manuales dispersos.
