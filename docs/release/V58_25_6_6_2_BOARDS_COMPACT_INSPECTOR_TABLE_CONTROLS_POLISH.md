# v58.25.6.6.2 — Boards Compact Inspector + Table Controls Polish

## Base

v58.25.6.6.1 — Boards Properties Locked Typecheck Fix

## Problema visual

El panel rediseñado quedó demasiado grande para una vista operativa tipo tablero. Además, el stepper de Tabla Visual no mostraba correctamente los números y visualmente se sentía pesado.

## Solución

- Se reduce ancho efectivo del inspector.
- Se compactan header, secciones y footer.
- Se compactan inputs X/Y/W/H.
- Se reescribe `CompactStepper` con números visibles y botones `-` / `+`.
- Se reduce tamaño de rows de columnas.
- Se compacta toolbar flotante.
- Se reduce minimap.
- Se aplica CSS de apoyo para tablas y controles del inspector.

## Archivos modificados

- `src/components/boards/properties-panel.tsx`
- `src/components/boards/floating-format-toolbar.tsx`
- `src/components/boards/board-minimap.tsx`
- `src/app/globals.css`
