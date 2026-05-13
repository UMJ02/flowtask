# FlowTask — v58.25.8 Workspace-First Foundation

Base: **v58.25.7.7 — Boards Hero + Template Icons + Notifications Metric Polish**

## Objetivo

Crear una nueva experiencia Workspace-First tipo ClickUp / Notion / Asana sin reemplazar los módulos existentes. La ruta nueva `/app/workspace` centraliza el contexto de trabajo con sidebar pro, header contextual, tabs de views, panel derecho y datos reales del app.

## Cambios principales

- Nueva ruta: `/app/workspace`.
- Nueva capa: `src/components/workspace-system/*`.
- Nuevos adapters: `src/lib/workspace-system/*`.
- Views dinámicas: Lista, Board, Timeline, Tabla, Canvas, Archivos y Reportes.
- CSS `ft-ws-*` agregado al final de `src/app/globals.css`.
- Datos reales desde `getTasks`, `getProjects` y `getReportsOverview`.
- Sin nuevas tablas ni migraciones en esta fase.

## Validación recomendada

```bash
npm install
npm run verify:current
npm run design:doctor
npm run density:guard
npm run density:guard:strict
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```

## Nota

Esta versión es foundation. Quick create, conexión profunda con BoardPage y persistencia de espacios/vistas quedan para la siguiente fase.
