# v58.25.6.5.1 — Boards Table Typecheck Fix

**Base:** v58.25.6.5 — Boards Table Spreadsheet Tools + Properties Panel Collapse

## Problema detectado por CLI

El `typecheck` fallaba con 7 errores:

- `rowStyles`, `columnStyles`, `cellStyles` no se reconocían sobre `BoardElement`.
- `handleClick(event)` enviaba un argumento no esperado.
- `BoardElementView` se usa también en `board-share-view.tsx` y faltaban nuevas props.
- `selectionMatches` leía propiedades no presentes en todos los miembros del union `BoardTableSelection`.

## Corrección

- Se fuerza narrowing seguro en el branch de tabla:
  - `const table = element`
- Se corrige el click:
  - `handleClick()`
- Se agregan no-op handlers en vista pública/share.
- Se discrimina correctamente `BoardTableSelection` en `selectionMatches`.

## Archivos modificados

- `src/components/boards/board-element.tsx`
- `src/components/boards/board-share-view.tsx`
- `src/lib/boards/table-tools.ts`
- versionado / docs / verify
