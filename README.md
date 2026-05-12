# FlowTask — v58.25.6.4.1 Kanban Overflow + Compact Action Fix

Base: **v58.25.6.4 — Organization + Settings + Notifications UI System Final Alignment**

## Objetivo

Corregir el desborde visual del Kanban después de la migración al sistema UI. El problema se daba porque las acciones circulares del card no tenían suficiente contención horizontal dentro de columnas más estrechas.

## Cambios principales

- Se agrega `ft-kanban-card-actions`.
- Se agrega `ft-kanban-action-strip` con overflow horizontal interno controlado.
- Se agrega `ft-kanban-action-button`.
- Se agrega `ft-kanban-date-pill`.
- Se evita que los iconos de acción empujen el card fuera de la columna.
- Se compactan acciones entre 1280px y 1535px.
- Se mantiene drag/drop, cambio de estado, prioridad y abrir tarea.

## Validación recomendada

```bash
npm install
npm run verify:v58.25.6.4.1
npm run design:doctor
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
