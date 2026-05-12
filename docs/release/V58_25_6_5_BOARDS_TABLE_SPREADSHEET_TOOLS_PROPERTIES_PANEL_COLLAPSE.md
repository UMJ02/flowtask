# v58.25.6.5 — Boards Table Spreadsheet Tools + Properties Panel Collapse

**Base:** v58.25.6.4.1 — Kanban Overflow + Compact Action Fix

## Objetivo

Agregar herramientas spreadsheet a las tablas dentro de Pizarras y permitir contraer/expandir el panel de propiedades.

## Funciones implementadas

### Tabla
- Selección de celda.
- Selección de fila completa.
- Selección de columna completa.
- Click derecho con menú contextual.
- Eliminar fila.
- Eliminar columna.
- Ocultar fila.
- Ocultar columna.
- Mostrar filas ocultas.
- Mostrar columnas ocultas.
- Color por selección usando la toolbar flotante.
- Fórmulas simples.
- Autorrelleno hacia abajo con handle visual.

### Fórmulas soportadas

- `=A1+B1`
- `=A1-B1`
- `=A1*B1`
- `=A1/B1`
- `=SUM(A1:A5)`
- `=AVG(A1:A5)`
- `=MIN(A1:A5)`
- `=MAX(A1:A5)`

### Autorrelleno

- Texto: repite valor.
- Número: continúa secuencia.
- Sufijo numérico: `Cliente 1` → `Cliente 2`.
- Fecha: avanza por día.

### Propiedades

- El panel derecho puede contraerse.
- El panel derecho puede expandirse.
- La preferencia no toca BD; es estado local visual.

## Archivos principales

- `src/lib/boards/board-types.ts`
- `src/lib/boards/board-serialization.ts`
- `src/lib/boards/board-defaults.ts`
- `src/lib/boards/table-tools.ts`
- `src/components/boards/board-element.tsx`
- `src/components/boards/board-page.tsx`
- `src/components/boards/properties-panel.tsx`
- `src/app/globals.css`
