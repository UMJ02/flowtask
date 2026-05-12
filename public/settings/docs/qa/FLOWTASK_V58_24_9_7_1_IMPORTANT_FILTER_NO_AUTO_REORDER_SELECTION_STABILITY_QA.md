# QA — v58.24.9.7.1 Important Filter + No Auto Reorder + Selection Stability

## 1. Selección en listado

1. Abrir `/app/tasks`.
2. Marcar el checkbox de una fila.
3. Confirmar que se marca esa misma fila.
4. Confirmar que la lista no salta.
5. Marcar varias filas.
6. Confirmar que no hay reordenamiento visual.

## 2. Importantes en listado

1. Marcar estrella en una tarea.
2. Confirmar que se resalta visualmente.
3. Confirmar que NO se mueve automáticamente arriba.
4. Activar `Solo importantes`.
5. Confirmar que solo se muestran tareas importantes.
6. Desactivar `Solo importantes`.

## 3. Kanban

1. Marcar estrella en una tarea dentro de una columna.
2. Confirmar que se resalta visualmente.
3. Confirmar que NO se reordena automáticamente.
4. Confirmar que se puede quitar la estrella.

## 4. CLI

```bash
npm install
npm run verify:v58.24.9.7.1
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
