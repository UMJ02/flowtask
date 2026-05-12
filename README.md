# FlowTask — v58.25.6.6.2 Boards Compact Inspector + Table Controls Polish

Base: **v58.25.6.6.1 — Boards Properties Locked Typecheck Fix**

## Objetivo

Compactar la experiencia visual de Pizarras después del rediseño del panel de propiedades.

## Correcciones

- Panel de propiedades menos grande.
- Header del panel más compacto.
- Secciones menos altas.
- Inputs X/Y/W/H más pequeños.
- Selector de filas/columnas corregido para que los números sean visibles.
- Botones `-` y `+` reales en stepper.
- Lista de columnas más compacta.
- Toolbar flotante más pequeña.
- Minimap más pequeño.
- Celdas/headers de tabla más compactos.

## Validación recomendada

```bash
npm install
npm run verify:v58.25.6.6.2
npm run design:doctor
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
