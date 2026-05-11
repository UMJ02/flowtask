# v58.24.9.7.1 — Important Filter + No Auto Reorder + Selection Stability

**Base:** v58.24.9.7 — Task Action Modal Polish + Safe Delete + Kanban Scale Hardening

## Problema

El reordenamiento automático por prioridad alta causaba una mala experiencia en el listado: al seleccionar un checkbox, la lista podía moverse o parecer que se seleccionaba otra fila.

## Solución

- Se elimina el reordenamiento automático por importantes.
- Las tareas importantes se resaltan visualmente.
- El usuario usa `Solo importantes` para filtrar.
- La selección masiva queda visualmente estable.

## Regla final

```txt
Importante = resaltar + filtrar
Importante NO = mover automáticamente
```

## Archivos tocados

- `src/components/tasks/task-action-list.tsx`
- `src/components/tasks/task-kanban-board.tsx`
- scripts/docs/version
