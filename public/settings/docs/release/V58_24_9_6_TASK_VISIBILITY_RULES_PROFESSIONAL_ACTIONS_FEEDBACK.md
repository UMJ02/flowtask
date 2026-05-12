# v58.24.9.6 — Task Visibility Rules + Professional Actions Feedback

**Base:** v58.24.9.5 — Important Tasks UX + Analytics Separation

## Problemas abordados

1. En `/app/tasks` podían sentirse tareas faltantes porque la query solo mostraba tareas independientes (`project_id is null`).
2. El Kanban podía sentirse incompleto por límite de carga.
3. La vista de detalle de tarea no tenía acción de eliminar.
4. Acciones de tareas usaban `window.alert` / `window.confirm`, poco profesional.

## Solución

- `/app/tasks` muestra todas las tareas del workspace.
- Concluidas se ocultan por default, pero se pueden incluir.
- Kanban del workspace sube límite a 500 tareas.
- Detalle de tarea agrega botón Eliminar con confirmación visual.
- Lista de tareas usa notices internos y confirmación visual.
- Se eliminan alert/confirm del flujo principal de tareas.

## Regla funcional final

```txt
/app/tasks:
  todas las tareas del workspace
  concluidas ocultas por default
  concluidas visibles por botón/filtro

Kanban:
  muestra tareas por estado
  incluye columna Hecho
  no mueve tareas entre estados por ocultar columnas

Detalle:
  puede editar y eliminar con confirmación interna
```
