# FlowTask — v58.24.9.4.1 Kanban Important Tasks Typecheck Fix

Base: **v58.24.9.4 — Task Priority Sync + Fresh Detail State + Attachment Icons + Loader Cleanup**

## Objetivo

Corregir los errores reales de TypeScript reportados en `src/components/tasks/task-kanban-board.tsx`.

## Errores corregidos

```txt
TS2304: Cannot find name 'importantFirstTasks'
TS7006: Parameter 'task' implicitly has an 'any' type
```

## Cambios

- Se declara `importantFirstTasks(items: TaskItem[])` dentro de `task-kanban-board.tsx`.
- Se tipa explícitamente `column.items.map((task: TaskItem) => ...)`.
- Se conserva el orden de importantes primero dentro del Kanban.
- Se conserva todo el alcance funcional de v58.24.9.4.

## Validación recomendada

```bash
npm install
npm run verify:v58.24.9.4.1
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
