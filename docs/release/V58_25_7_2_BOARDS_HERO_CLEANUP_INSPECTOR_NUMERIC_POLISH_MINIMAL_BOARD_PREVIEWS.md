# v58.25.7.2 — Boards Hero Cleanup + Inspector Numeric Polish + Minimal Board Previews

## Base

v58.25.7.1 — Deep Density Component Refactor + Hardcoded Style Cleanup

## Objetivo

Eliminar peso visual innecesario en Pizarras y mejorar la precisión visual del inspector.

## Cambios

### Boards Home

- Se elimina la imagen grande del hero.
- Se reemplaza por un preview minimalista construido con CSS.
- Se reemplazan previews de templates por iconografía minimalista.
- Se mejora placeholder de pizarras recientes.
- Se baja altura/peso visual de tarjetas recientes y templates.

### Inspector

- Los inputs X/Y/W/H ahora usan `board-inspector-metric`.
- Los valores quedan centrados.
- Se ocultan spinners nativos del input number.
- El `px` queda como unidad secundaria.
- La caja se ve más limpia y menos corrida hacia la derecha.

## Archivos principales

- `src/components/boards/boards-home.tsx`
- `src/components/boards/properties-panel.tsx`
- `src/app/globals.css`
