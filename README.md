# FlowTask — v58.25.6.2 Projects UI System Migration

Base: **v58.25.6.1 — Tasks + Kanban UI System Migration**

## Objetivo

Migrar Proyectos al sistema visual madre creado en v58.25.6, para mantener una sola arquitectura de diseño en listados, filtros, formulario, detalle, tareas internas y timeline.

## Cambios principales

- Se agrega `ft-projects-screen` como shell global de proyectos.
- Listado principal usa `ft-projects-hero`, `ft-projects-panel`, `ft-projects-filter-panel`.
- Métricas usan `ft-project-metric-card`.
- Acciones usan `ft-project-action` y `ft-project-action-primary`.
- Detalle usa `ft-project-detail-panel`.
- Formulario usa `ft-project-form-panel` y controles globales.
- Tareas internas usan `ft-project-inline-task-row`.
- Timeline usa `ft-project-timeline-panel`.
- Se reduce uso de estilos por pantalla y se alinea con la arquitectura UI de FlowTask.

## Funcionalidad preservada

- Listado.
- Filtros.
- Crear proyecto.
- Editar proyecto.
- Detalle.
- Tareas internas.
- Timeline.
- Exportar CSV.
- Compartir / miembros / permisos.
- Acciones de borrar donde ya existían.

## Validación recomendada

```bash
npm install
npm run verify:v58.25.6.2
npm run design:doctor
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
