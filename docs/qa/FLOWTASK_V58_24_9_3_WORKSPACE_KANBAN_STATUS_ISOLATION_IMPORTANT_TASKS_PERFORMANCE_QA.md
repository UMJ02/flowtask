# QA — v58.24.9.3 Workspace Kanban Status Isolation + Important Tasks Performance

## 1. Columnas Kanban

1. Crear tareas en:
   - En progreso
   - Producción
   - En espera
   - Hecho
2. Abrir dashboard.
3. Confirmar que cada tarea aparece en su columna correspondiente.
4. Ocultar la columna `Hecho`.
5. Confirmar que las tareas concluidas NO aparecen en `En progreso`.
6. Volver a mostrar `Hecho`.
7. Confirmar que las tareas concluidas regresan a `Hecho`.

## 2. Importantes

1. En una card del Kanban, presionar la estrella.
2. Confirmar que la tarea queda con `priority = alta`.
3. Confirmar que el KPI `Importantes` sube.
4. Volver a presionar la estrella.
5. Confirmar que vuelve a `priority = media`.
6. Confirmar que el KPI baja.

## 3. Crear tarea

1. Crear una tarea nueva.
2. Seleccionar prioridad alta.
3. Confirmar que aparece como importante en el dashboard.

## 4. Performance básica

1. Cambiar columnas visibles varias veces.
2. Confirmar que no hay mezcla visual.
3. Confirmar que no se requiere refresh manual.
