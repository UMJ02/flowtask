# FlowTask — v58.25.7.3.1 Boards Readiness Alignment Fix

Base: **v58.25.7.3 — Boards Hero Remove + Template Icons Restore**

## Objetivo

Corregir el fallo de `deploy:readiness` causado por scripts internos todavía alineados a `v58.25.7.2`.

## Cambios

- Readiness scripts actualizados a `v58.25.7.3.1`.
- `verify:current` actualizado.
- `package-lock.json` alineado.
- `src/lib/release/version.ts` alineado.
- Se mantiene el cambio visual de Pizarras:
  - hero sin imagen grande
  - plantillas con assets restaurados
  - `nuevo_proyecto.png` soportado

## Validación recomendada

```bash
npm install
npm run verify:v58.25.7.3.1
npm run design:doctor
npm run density:guard
npm run density:guard:strict
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
