# FlowTask — v58.25.1 Settings Footer Cleanup + Alignment Polish

Base: **v58.25 — Settings Hub Redesign**

## Objetivo

Corregir el footer duplicado en Settings y ajustar el rediseño para que se sienta mejor alineado con la app general.

## Cambios principales

- Se eliminó el footer propio de Settings.
- Settings vuelve a usar solo el footer global de la app.
- Se removió `SettingsFooter` de `src/app/(app)/app/settings/page.tsx`.
- Se eliminó `src/components/settings/settings-footer.tsx`.
- Se redujo padding/altura en hero, métricas, acceso y plan, asistente y zona de peligro.
- Se ajustaron sombras y bordes de `ft-settings-card` para que no se vea como un bloque aislado del resto de FlowTask.
- Se suavizó el estilo de botones verdes y ghost.
- Se mantuvieron todas las funcionalidades de Settings.

## Validación recomendada

```bash
npm install
npm run verify:v58.25.1
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
