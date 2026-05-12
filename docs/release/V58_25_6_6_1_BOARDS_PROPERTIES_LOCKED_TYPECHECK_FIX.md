# v58.25.6.6.1 — Boards Properties Locked Typecheck Fix

## Base

v58.25.6.6 — Boards Floating Layout + Properties Panel Redesign

## Problema

El `typecheck` fallaba en:

```txt
src/components/boards/properties-panel.tsx:313:27
Type 'boolean | undefined' is not assignable to type 'boolean'.
```

`selected.locked` es opcional en el tipo de `BoardElement`, pero `ToggleSwitch` recibe `checked: boolean`.

## Corrección

Se cambió:

```tsx
checked={selected.locked}
```

por:

```tsx
checked={Boolean(selected.locked)}
```

## Impacto

- No cambia funcionalidad.
- No toca BD.
- No modifica diseño.
- Solo normaliza el valor para TypeScript.
