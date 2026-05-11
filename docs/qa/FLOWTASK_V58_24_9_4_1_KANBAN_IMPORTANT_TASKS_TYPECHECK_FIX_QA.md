# QA — v58.24.9.4.1 Kanban Important Tasks Typecheck Fix

## CLI

```bash
npm install
npm run verify:v58.24.9.4.1
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```

## Funcional

1. Abrir dashboard.
2. Confirmar que el Kanban carga.
3. Marcar una tarea como importante.
4. Confirmar que se mantiene de primera en su columna.
5. Ocultar/mostrar columnas y confirmar que los estados no se mezclan.
