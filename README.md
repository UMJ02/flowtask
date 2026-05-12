# FlowTask — v58.25.6.6.1 Boards Properties Locked Typecheck Fix

Base: **v58.25.6.6 — Boards Floating Layout + Properties Panel Redesign**

## Objetivo

Corregir el error de TypeScript en `src/components/boards/properties-panel.tsx` donde `selected.locked` podía ser `undefined`, pero `ToggleSwitch` espera un boolean estricto.

## Fix aplicado

```tsx
<ToggleSwitch
  checked={Boolean(selected.locked)}
  onChange={(checked) => onPatch({ locked: checked } as Partial<BoardElement>)} 
/>
```

## Validación recomendada

```bash
npm install
npm run verify:v58.25.6.6.1
npm run design:doctor
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
