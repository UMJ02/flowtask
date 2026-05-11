# v58.25 — Settings Hub Redesign

**Base:** v58.24.9.10 — Session Security + Interaction Performance + Account Danger Zone + Auth Asset Fix

## Objetivo

Rediseñar Settings siguiendo la guía UX/UI del PDF adjunto, manteniendo las funcionalidades existentes.

## Elementos preservados

- Cuenta/contexto
- métricas
- acceso y plan
- preferencias operativas
- preferencias de notificaciones
- canales y automatización
- asistente inteligente avanzado
- zona de peligro / eliminar cuenta
- footer

## Archivos principales

- `src/app/(app)/app/settings/page.tsx`
- `src/components/settings/settings-account-overview.tsx`
- `src/components/settings/access-control-settings-card.tsx`
- `src/components/notifications/notification-preferences-form.tsx`
- `src/components/settings/intelligent-attention-settings-card.tsx`
- `src/components/settings/account-danger-zone.tsx`
- `src/components/settings/settings-footer.tsx`
- `src/app/globals.css`

## Notas

El rediseño usa el código recomendado del PDF como referencia, pero adaptado a los componentes reales ya existentes para no romper lógica actual.
