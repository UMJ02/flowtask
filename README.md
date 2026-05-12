# FlowTask — v58.25.6.6 Boards Floating Layout + Properties Panel Redesign

Base: **v58.25.6.5.1 — Boards Table Typecheck Fix**

## Objetivo

Refinar la experiencia de Pizarras en tres frentes:

- mover el minimap para que no quede oculto por el panel de propiedades
- mover la barra superior flotante para que conviva mejor con el panel
- rediseñar el panel de propiedades con un layout premium, compacto y colapsable

## Cambios principales

- `PropertiesPanel` rediseñado con:
  - ancho amplio (~448px)
  - header sticky
  - footer sticky
  - secciones colapsables
  - modo colapsado en rail de iconos
  - grid compacto para posición/tamaño
  - controles de tabla más visuales
  - lista de columnas más limpia
- `FloatingFormatToolbar` ahora acepta `rightOffset` para reposicionarse.
- `BoardMiniMap` ahora acepta `rightOffset`, `hidden` y `onHiddenChange`.
- `BoardPage` controla el estado colapsado del panel y desplaza los overlays flotantes para evitar solapamientos.

## Validación recomendada

```bash
npm install
npm run verify:v58.25.6.6
npm run design:doctor
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
