# v58.25.6 — Design System Consolidation + App UI Architecture Hardening

**Base:** v58.25.5.1 — Records Metric Text Overflow Fix

## Qué resuelve

La app tenía varias capas visuales coexistiendo: estilos antiguos, `ft-apple`, `ft-settings`, `ft-notifications`, clases directas de Tailwind, shadows custom, radii variados y controles sin una línea común.

Esta versión crea una capa central para gobernar:

- Page shells
- Cards
- Panels
- Rows
- Inputs
- Selects
- Textareas
- Checkboxes
- Switches
- Ranges
- Buttons
- Chips
- Metrics
- Motion

## Archivos principales

- `src/app/globals.css`
- `src/components/layout/app-shell.tsx`
- `src/lib/design-system/ui.ts`
- `src/lib/design-system/tokens.ts`
- `scripts/design-doctor.mjs`

## Guardrails

`npm run design:doctor` valida que el sistema tenga:

- `ft-app-root`
- controles globales bajo `.ft-app-root`
- cero `hover:-translate`
- límites razonables de estilos hardcodeados

## Resultado esperado

La app debe sentirse más fina, compacta y coherente: menos cards enormes, menos bordes raros, menos controles sin estilo, menos sombras por pantalla y mejor alineación general.
