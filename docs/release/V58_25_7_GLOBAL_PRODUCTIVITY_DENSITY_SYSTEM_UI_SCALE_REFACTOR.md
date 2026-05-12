# v58.25.7 — Global Productivity Density System + UI Scale Refactor

## Base

v58.25.6.6.2 — Boards Compact Inspector + Table Controls Polish

## Objetivo

Crear una capa global de densidad visual para FlowTask, inspirada en herramientas de productividad compactas y limpias.

## Alcance

### Sistema global

- Tokens de densidad.
- Radios más pequeños.
- Paddings más compactos.
- Filas/listas más bajas.
- Inputs/selects/botones más técnicos.
- Cards y panels menos pesados.
- Métricas más compactas.
- Tipografía interna más controlada.

### Módulos impactados por clase global

- Dashboard.
- Analytics.
- Reports.
- Tasks.
- Kanban.
- Projects.
- Settings.
- Notifications.
- Organization.
- Profile.
- Boards.
- Board inspector.
- Board tables.

## Nuevo script

```bash
npm run density:guard
```

Sirve para detectar deuda visual que vuelva a inflar la app.

## Archivos principales

- `src/app/globals.css`
- `scripts/density-guard.mjs`
- `package.json`
- `src/lib/release/version.ts`
