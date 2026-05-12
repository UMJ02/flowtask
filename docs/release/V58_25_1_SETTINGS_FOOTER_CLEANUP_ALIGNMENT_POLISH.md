# v58.25.1 — Settings Footer Cleanup + Alignment Polish

**Base:** v58.25 — Settings Hub Redesign

## Problema

Settings estaba mostrando footer duplicado:

1. Footer global de la app.
2. Footer nuevo agregado en Settings.

Además, algunos estilos del rediseño se sentían un poco separados del sistema visual general de FlowTask.

## Solución

- Eliminar footer local de Settings.
- Conservar solo footer global.
- Ajustar spacing y densidad visual.
- Pulir cards, sombras, botones y métricas para que se integren mejor con la app.
- Mantener el rediseño del PDF sin duplicar elementos globales.

## Archivos tocados

- `src/app/(app)/app/settings/page.tsx`
- `src/app/globals.css`
- `src/components/settings/settings-account-overview.tsx`
- `src/components/settings/access-control-settings-card.tsx`
- `src/components/notifications/notification-preferences-form.tsx`
- `src/components/settings/intelligent-attention-settings-card.tsx`
- `src/components/settings/account-danger-zone.tsx`
