# v58.25.6.4 — Organization + Settings + Notifications UI System Final Alignment

**Base:** v58.25.6.3 — Dashboard + Analytics UI System Migration

## Objetivo

Cerrar la migración visual de pantallas administrativas/configuración usando el sistema madre FlowTask.

## Alcance aplicado

### Organization
- `ft-org-screen`
- `ft-org-hero`
- `ft-org-panel`
- `ft-org-card`
- `ft-org-row`
- `ft-org-metric-grid`
- `ft-org-metric`
- `ft-org-title`
- `ft-org-copy`
- `ft-org-action`
- `ft-org-action-primary`
- `ft-org-action-danger`
- `ft-org-chip`

### Settings
- `ft-settings-screen`
- `ft-settings-hero-system`
- `ft-settings-panel`
- `ft-settings-row`
- `ft-settings-metric-grid`
- `ft-settings-metric`
- `ft-settings-system-action`
- `ft-settings-system-action-primary`
- `ft-settings-danger-panel`

### Notifications
- `ft-notifications-ui-screen`
- `ft-notifications-hero-system`
- `ft-notifications-ui-panel`
- `ft-notifications-metric-grid`
- `ft-notifications-metric`
- `ft-notifications-system-chip`
- `ft-notification-system-row`

### Profile
- `ft-profile-screen`
- `ft-profile-hero`
- `ft-profile-panel`
- `ft-profile-card`

## Decisiones UX/UI

- Se elimina hero oscuro de Profile para mantener coherencia.
- Settings y Notifications conservan su rediseño pero usan aliases del sistema madre.
- Organization deja de depender de cards/paddings aislados.
- Danger zones se mantienen visualmente claras, pero integradas al sistema.
- Toggles, checkboxes, selects e inputs siguen usando la capa global de v58.25.6.
