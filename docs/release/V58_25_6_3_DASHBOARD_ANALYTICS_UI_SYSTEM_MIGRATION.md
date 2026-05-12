# v58.25.6.3 — Dashboard + Analytics UI System Migration

**Base:** v58.25.6.2 — Projects UI System Migration

## Objetivo

Migrar Dashboard, Analytics y Reports a una sola arquitectura visual, siguiendo la capa base creada en v58.25.6.

## Alcance aplicado

### Dashboard
- `ft-dashboard-screen`
- `ft-dashboard-hero`
- `ft-dashboard-panel`
- `ft-dashboard-card`
- `ft-dashboard-metric-grid`
- `ft-dashboard-metric`
- `ft-dashboard-action`
- `ft-dashboard-action-primary`
- `ft-dashboard-row`

### Analytics
- `ft-analytics-screen`
- `ft-analytics-hero`
- `ft-analytics-panel`
- `ft-analytics-card`
- `ft-analytics-metric-grid`
- `ft-analytics-metric`
- `ft-analytics-action`
- `ft-analytics-action-primary`
- `ft-analytics-row`

### Reports
- `ft-reports-screen`
- `ft-report-hero`
- `ft-report-panel`
- `ft-report-card`
- `ft-report-metric-grid`
- `ft-report-metric`
- `ft-report-action`
- `ft-report-action-primary`
- `ft-report-row`

### Charts
- `ft-chart-frame`
- `ft-chart-toolbar`

## Decisiones UX/UI

- Cards y métricas más compactas.
- Acciones con una sola arquitectura.
- Paneles y charts más consistentes.
- Se elimina hover lift en estas vistas.
- Se mantiene un estilo limpio tipo Apple/Notion/Asana, con foco en lectura y acción.
