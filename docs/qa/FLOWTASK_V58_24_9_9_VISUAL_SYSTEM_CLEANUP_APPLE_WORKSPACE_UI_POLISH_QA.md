# QA — v58.24.9.9 Visual System Cleanup + Apple Workspace UI Polish

## 1. Visual consistency

1. Abrir `/app/tasks`.
2. Confirmar que cards, botones y toolbar se sienten consistentes.
3. Abrir `/app/tasks/trash`.
4. Confirmar que usa la misma superficie visual.
5. Abrir dashboard/workspace.
6. Confirmar que cards y Kanban no se ven como pantallas separadas.

## 2. Motion

1. Marcar importante.
2. Confirmar highlight suave, sin mover la fila.
3. Cambiar filtros.
4. Confirmar que no hay animaciones decorativas innecesarias.
5. Probar con `prefers-reduced-motion` si aplica.

## 3. Kanban

1. Confirmar que las cards importantes se resaltan.
2. Confirmar que no se reordenan automáticamente.
3. Confirmar que columnas siguen claras.

## 4. Tareas

1. Confirmar botón Papelera.
2. Confirmar Nueva tarea.
3. Confirmar listado estable.
4. Confirmar que acciones siguen funcionando.

## 5. CLI

```bash
npm install
npm run verify:v58.24.9.9
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
