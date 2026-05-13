# v58.25.7.3.1 — Boards Readiness Alignment Fix

## Base

v58.25.7.3 — Boards Hero Remove + Template Icons Restore

## Problema

`typecheck` pasaba, pero `build:preflight` fallaba en `deploy:readiness` porque los scripts de readiness seguían esperando la versión anterior `v58.25.7.2`.

## Fix

- `package.json` alineado a `58.25.7.3.1`.
- `package-lock.json` alineado.
- `src/lib/release/version.ts` alineado.
- `verify:current` apunta a `verify:v58.25.7.3.1`.
- `build-deploy-readiness.mjs` actualizado.
- `deploy-production-readiness.mjs` actualizado.
- Se mantiene el cambio visual de Boards: hero sin imagen + assets de plantillas restaurados.
