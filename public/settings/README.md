# FlowTask — v58.25.6.3 Dashboard + Analytics UI System Migration

Base: **v58.25.6.2 — Projects UI System Migration**

## Objetivo

Migrar Dashboard, Analytics y Reports al sistema visual madre creado en v58.25.6 para reducir cards grandes, paddings sueltos, sombras custom, textos sin wrap y estilos aislados.

## Cambios principales

- Dashboard usa `ft-dashboard-*`.
- Analytics usa `ft-analytics-*`.
- Reports usa `ft-report-*`.
- Hero, paneles, métricas, filas, acciones y charts quedan bajo una sola arquitectura.
- Se eliminan hover lift innecesarios.
- Se compactan cards y métricas.
- Se preserva toda la funcionalidad.

## Validación recomendada

```bash
npm install
npm run verify:v58.25.6.3
npm run design:doctor
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
