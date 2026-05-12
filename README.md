# FlowTask — v58.25.3 Settings Width + Compact Hero/Metrics

Base: **v58.25.2 — Settings Colorful Redesign Alignment**

## Objetivo

Ajustar la vista de Settings para que ocupe todo el ancho disponible del contenedor del app/header y reducir el tamaño visual del hero y de las métricas.

## Cambios principales

- `ft-settings-shell` ahora usa `width: 100%` y `max-width: none`.
- Hero más compacto:
  - menor `min-height`
  - menor padding
  - ilustración derecha más pequeña
  - columna visual derecha más contenida
- Métricas más compactas:
  - menor padding
  - menor radius
  - iconos más pequeños
  - tipografía un poco más compacta
- Se mantiene el asset `/settings/herosettings.png`.
- No se toca funcionalidad de permisos, preferencias, asistente ni eliminación de cuenta.

## Validación recomendada

```bash
npm install
npm run verify:v58.25.3
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
