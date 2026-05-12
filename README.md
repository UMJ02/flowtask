# FlowTask — v58.25.7 Global Productivity Density System + UI Scale Refactor

Base: **v58.25.6.6.2 — Boards Compact Inspector + Table Controls Polish**

## Objetivo

Aplicar una capa global de densidad visual tipo productividad pro para que toda la app se sienta más compacta, minimalista, operativa y alineada a referencias como ClickUp, Notion, Asana y Linear.

## Cambio principal

Esta versión agrega una capa global en `globals.css` con tokens de densidad y overrides controlados para:

- pantallas internas
- cards
- panels
- heros
- métricas
- botones
- inputs
- selects
- badges
- chips
- rows/listas
- Kanban
- Boards
- inspector de Pizarras
- tablas internas

## Tokens agregados

```css
--ft-density-page-gap
--ft-density-section-gap
--ft-density-card-padding
--ft-density-panel-padding
--ft-density-control-height-sm
--ft-density-control-height
--ft-density-control-height-lg
--ft-density-row-height
--ft-density-radius-card
--ft-density-radius-panel
--ft-density-radius-control
--ft-density-title-page
--ft-density-title-section
--ft-density-title-card
--ft-density-body
--ft-density-muted
--ft-density-label
```

## Nuevo guardrail

```bash
npm run density:guard
```

Este script detecta patrones que vuelven a inflar la UI:

- paddings grandes
- radios gigantes
- textos internos enormes
- controles muy altos
- sombras pesadas

## Validación recomendada

```bash
npm install
npm run verify:v58.25.7
npm run design:doctor
npm run density:guard
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
