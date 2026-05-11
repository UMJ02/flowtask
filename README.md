# FlowTask — v58.24.9.7.1 Important Filter + No Auto Reorder + Selection Stability

Base: **v58.24.9.7 — Task Action Modal Polish + Safe Delete + Kanban Scale Hardening**

## Objetivo

Corregir el comportamiento raro del listado donde al seleccionar un checkbox parecía marcarse otra tarea o la lista hacía un movimiento visual.

## Decisión UX

Se elimina el reordenamiento automático por tareas importantes.

- Marcar una estrella ya no mueve automáticamente la tarea.
- Una tarea importante se resalta visualmente.
- El usuario puede filtrar con `Solo importantes`.
- La lista mantiene su orden estable, especialmente durante selección masiva.
- El Kanban también mantiene el orden manual/actual y solo resalta importantes.

## Cambios principales

### Listado de tareas

- Se remueve `importantFirstTasks()` del pipeline visual.
- `visibleItems` respeta el orden original recibido.
- `Solo importantes` se conserva como filtro.
- Tareas importantes se resaltan con fondo suave ámbar y animación ligera.
- Los checkboxes ya no deberían saltar a otra fila por reordenamiento.

### Kanban

- Se remueve el reordenamiento automático por prioridad alta.
- Se conserva el orden de columna/manual.
- Las tareas importantes se resaltan visualmente.
- La estrella sigue funcionando para marcar/quitar importante.

## Validación recomendada

```bash
npm install
npm run verify:v58.24.9.7.1
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
