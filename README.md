# FlowTask — v58.24.9.6 Task Visibility Rules + Professional Actions Feedback

Base: **v58.24.9.5 — Important Tasks UX + Analytics Separation**

## Objetivo

Dejar el flujo de tareas más profesional y consistente:

- La vista `/app/tasks` muestra todas las tareas del workspace, no solo tareas independientes.
- Las tareas concluidas se ocultan por defecto para no ensuciar la lista.
- El botón `Incluir concluidas` o el filtro `status=concluido` permite verlas.
- El Kanban del workspace conserva columna `Hecho` y carga más tareas para evitar que falten registros.
- La vista de detalle de tarea incluye acción de eliminar.
- Se reemplazan `window.alert` / `window.confirm` en tareas por feedback interno y confirmación visual.

## Cambios principales

### Visibilidad

- `getTasks()` ya no fuerza `project_id is null`.
- `/app/tasks` pasa a ser centro operativo de todas las tareas del workspace.
- Concluidas siguen ocultas por default salvo `includeCompleted=true` o `status=concluido`.
- Workspace Kanban aumenta carga de tareas de 120 a 500.

### Acciones profesionales

- `TaskActionList` elimina avisos del navegador:
  - no `window.alert`
  - no `window.confirm`
- Se agrega `notice` interno para éxito/error.
- Se agrega confirmación visual para eliminar una o varias tareas.
- `TaskWorkspaceInline` agrega botón eliminar en detalle de tarea.
- Eliminar desde detalle muestra confirmación visual y redirige a `/app/tasks`.

## Validación recomendada

```bash
npm install
npm run verify:v58.24.9.6
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
