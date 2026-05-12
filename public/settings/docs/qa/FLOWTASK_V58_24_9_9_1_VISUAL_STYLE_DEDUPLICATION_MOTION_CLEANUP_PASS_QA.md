# QA — v58.24.9.9.1 Visual Style Deduplication + Motion Cleanup Pass

## 1. Tareas

1. Abrir `/app/tasks`.
2. Confirmar que la toolbar, cards, botones y tabla se ven más unificados.
3. Marcar importante.
4. Confirmar highlight suave sin movimiento de fila.
5. Seleccionar checkboxes.
6. Confirmar que no hay salto visual.

## 2. Kanban

1. Abrir dashboard/workspace.
2. Confirmar columnas claras.
3. Marcar importante.
4. Confirmar que se resalta sin reordenamiento.
5. Mover una tarea de columna.
6. Confirmar que el feedback de drag se mantiene funcional.

## 3. Papelera / detalle

1. Abrir `/app/tasks/trash`.
2. Confirmar superficie visual consistente.
3. Abrir detalle de tarea.
4. Confirmar que panels/cards se sienten del mismo sistema.

## 4. Motion

1. Confirmar que no hay hover que levanta cards exageradamente.
2. Confirmar que no hay loaders decorativos.
3. Confirmar que skeleton y feedback de importante siguen funcionando.

## 5. CLI

```bash
npm install
npm run verify:v58.24.9.9.1
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
