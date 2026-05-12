# FlowTask — v58.25.6 Design System Consolidation + App UI Architecture Hardening

Base: **v58.25.5.1 — Records Metric Text Overflow Fix**

## Objetivo

Consolidar una sola arquitectura visual para toda la app. Esta versión no rediseña una pantalla específica; crea una capa madre para alinear cards, inputs, selects, checkboxes, toggles, botones, chips, métricas, rows, sombras, radios y motion.

## Inspiración aplicada

- Apple: jerarquía, armonía, consistencia, alineación y layout adaptable.
- Asana: claridad, foco, interacciones rápidas e intencionales.
- Notion: contenido limpio, controles simples y baja fricción.

## Cambios principales

### App root

`AppShell` ahora agrega:

```txt
ft-app-root
```

Esto permite aplicar reglas globales seguras sin afectar páginas públicas.

### Capa global de diseño

Se agrega en `src/app/globals.css`:

```txt
ft-page-frame
ft-page-hero
ft-panel
ft-card
ft-subcard
ft-card-muted
ft-row
ft-list-row
ft-heading-page
ft-heading-section
ft-copy
ft-kicker
ft-chip
ft-chip-active
ft-metric-card
ft-metric-label
ft-metric-value
ft-switch
ft-toggle
ft-actionbar
ft-danger-zone
```

### Formularios normalizados

Bajo `.ft-app-root`, se normalizan:

```txt
input
select
textarea
checkbox
range
switch/toggle
focus ring
```

### Toggles y checkboxes

- Checkboxes globales ahora tienen estilo propio.
- `ft-switch` / `ft-toggle` crea toggles tipo switch.
- Preferencias de notificaciones y personalización fina del asistente usan switches.

### Botones y acción

Se consolidan:

```txt
ft-btn-primary
ft-btn-secondary
ft-btn-danger
ft-action-primary
ft-action-secondary
ft-action-danger
```

### Design doctor

Nuevo script:

```bash
npm run design:doctor
```

Valida guardrails de diseño:

```txt
ft-app-root presente
global controls presente
hover:-translate prohibido
límites de tokens hardcodeados
límites de sombras custom
```

### UI architecture exports

Nuevo archivo:

```txt
src/lib/design-system/ui.ts
```

Exporta `ftui`, una arquitectura central para futuras migraciones.

## Validación recomendada

```bash
npm install
npm run verify:v58.25.6
npm run design:doctor
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
