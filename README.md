# FlowTask — v58.25.6.4 Organization + Settings + Notifications UI System Final Alignment

Base: **v58.25.6.3 — Dashboard + Analytics UI System Migration**

## Objetivo

Alinear Organización, Settings, Notifications y Profile con el sistema visual madre de v58.25.6 para cerrar la etapa de administración/configuración con una sola arquitectura visual.

## Cambios principales

- Organization usa `ft-org-*`.
- Settings usa `ft-settings-screen`, `ft-settings-panel`, `ft-settings-hero-system` y métricas del sistema.
- Notifications usa `ft-notifications-ui-*` y chips/rows del sistema.
- Profile deja hero oscuro y pasa a hero/panel blanco del sistema.
- Se normalizan cards, filas, acciones, métricas y danger panels.
- Se preservan todas las funcionalidades de organización, settings, notificaciones y perfil.

## Validación recomendada

```bash
npm install
npm run verify:v58.25.6.4
npm run design:doctor
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
