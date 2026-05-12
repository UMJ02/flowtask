# FlowTask — v58.25.6.5.1 Boards Table Typecheck Fix

Base: **v58.25.6.5 — Boards Table Spreadsheet Tools + Properties Panel Collapse**

## Objetivo

Corregir errores de TypeScript encontrados en CLI después de agregar herramientas spreadsheet a tablas de Pizarras.

## Fixes

- `board-element.tsx`: se fija el narrowing de tabla usando `const table = element` dentro del branch `element.type === "table"`.
- `board-element.tsx`: se corrige `handleClick(event)` porque `handleClick` no recibe argumentos.
- `board-share-view.tsx`: se agregan handlers no-op para las nuevas props obligatorias de `BoardElementView`.
- `table-tools.ts`: se corrige `selectionMatches` usando discriminación segura del union `BoardTableSelection`.

## Validación recomendada

```bash
npm install
npm run verify:v58.25.6.5.1
npm run design:doctor
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
