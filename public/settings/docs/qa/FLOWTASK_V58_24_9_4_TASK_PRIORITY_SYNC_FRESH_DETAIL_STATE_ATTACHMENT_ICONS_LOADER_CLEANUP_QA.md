# QA — v58.24.9.4 Task Priority Sync + Fresh Detail State + Attachment Icons + Loader Cleanup

## 1. Importantes en Kanban

1. Abrir dashboard.
2. Marcar una tarea con estrella.
3. Confirmar que queda con estrella activa.
4. Confirmar que sube el KPI `Importantes`.
5. Confirmar que aparece primero en su columna.
6. Quitar estrella.
7. Confirmar que baja el KPI y deja de estar priorizada.

## 2. Importantes en listado

1. Abrir `/app/tasks`.
2. Marcar una tarea con estrella en la tabla.
3. Confirmar que la tarea cambia a prioridad alta.
4. Confirmar que aparece primero en el listado.
5. Quitar estrella y validar que vuelve a media.

## 3. Fecha fresca en detalle

1. Abrir detalle de tarea.
2. Editar fecha límite.
3. Guardar.
4. Confirmar que la fecha visible cambia inmediatamente.
5. Volver a editar.
6. Confirmar que el input muestra la fecha nueva, no la vieja.

## 4. Adjuntos

1. Subir imagen.
2. Confirmar thumbnail real.
3. Subir PDF.
4. Confirmar icono de documento/PDF.
5. Subir Excel/CSV.
6. Confirmar icono de spreadsheet.
7. Subir ZIP/RAR.
8. Confirmar icono comprimido.

## 5. Loaders

1. Abrir login/register.
2. Confirmar que no aparece loader animado de dots.
3. Navegar entre vistas internas.
4. Confirmar skeleton interno simple.
