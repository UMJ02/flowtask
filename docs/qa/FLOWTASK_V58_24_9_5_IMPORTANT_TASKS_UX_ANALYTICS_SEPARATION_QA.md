# QA — v58.24.9.5 Important Tasks UX + Analytics Separation

## 1. Kanban estrella

1. Abrir dashboard.
2. Marcar estrella en una tarea.
3. Confirmar que queda activa.
4. Confirmar que la tarea sube de primero dentro de su columna.
5. Confirmar que el KPI `Importantes` sube sin refresh manual.
6. Quitar estrella.
7. Confirmar que vuelve a `priority = media`.
8. Confirmar que el KPI baja sin refresh manual.

## 2. Listado

1. Abrir `/app/tasks`.
2. Marcar estrella desde el listado.
3. Confirmar que se ve activa.
4. Activar `Solo importantes`.
5. Confirmar que solo se muestran tareas con `priority = alta`.
6. Desactivar `Solo importantes`.
7. Confirmar que vuelve la lista completa.

## 3. Analítica

1. Marcar una tarea importante.
2. Confirmar que no cambia de estado.
3. Confirmar que no se marca como concluida.
4. Confirmar que no cambia porcentaje de avance.
5. Confirmar que solo cambia prioridad/orden visual.

## 4. CLI

```bash
npm install
npm run verify:v58.24.9.5
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
