# FlowTask — v58.25.6.1 Tasks + Kanban UI System Migration

Base: **v58.25.6 — Design System Consolidation + App UI Architecture Hardening**

## Objetivo

Migrar la vista de Tareas y Kanban al sistema visual base creado en v58.25.6, reduciendo cards enormes, bordes repetidos, paddings sueltos, controles desalineados y estilos específicos fuera de arquitectura.

## Cambios principales

- Se agrega `ft-tasks-screen` como shell de tareas.
- Lista de tareas migra a `ft-tasks-table`, `ft-tasks-table-head` y `ft-tasks-row`.
- Acciones de tareas usan `ft-task-icon-button`.
- Estrella de importante usa `ft-task-star` y `ft-task-star-active`.
- Kanban migra a `ft-kanban-grid`, `ft-kanban-column`, `ft-kanban-card` y estados de drop.
- Filtros de tareas usan `ft-task-filter-panel`.
- Formulario de tarea usa `ft-task-form-panel` y base del sistema para inputs/selects.
- Se elimina la animación de pulso importante y se reemplaza por resaltado estable.
- Se preserva la lógica de:
  - selección
  - prioridad importante
  - paginación
  - eliminación segura
  - drag/drop de Kanban
  - columnas por estado
  - vista calendario

## Validación recomendada

```bash
npm install
npm run verify:v58.25.6.1
npm run design:doctor
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
