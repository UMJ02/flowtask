# QA — v58.27.7 Workspace Pro Render Diet + Dead UI Removal

## Checks CLI

```bash
npm run verify:current
npm run workspace:render-diet:ready
npm run workspace:deep-cleanup:ready
npm run typecheck
npm run build:preflight
npm run build
```

## QA manual

- Abrir `/app/workspace?view=home` y confirmar carga liviana.
- Abrir `/app/workspace?view=projects` y expandir proyectos con tareas anidadas.
- Abrir `/app/workspace?view=board` y validar columnas visibles, ocultar/mostrar concluidas y drag/drop.
- Abrir inspector y confirmar que no se monta hasta tocar el botón.
- Abrir Command Center y Share Panel solo bajo demanda.
- Confirmar que rutas clásicas siguen vivas: `/app/tasks`, `/app/projects`, `/app/boards`, `/app/reports`.
