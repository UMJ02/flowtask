# VERSION REPORT v8.10.0 — design-views-v12

## Cambios incluidos
- Nueva página `/app/pizarra` con los módulos clave de la pizarra interactiva.
- Pizarra agregada al sidebar en segunda posición.
- Nueva barra de búsqueda unificada con campo, botón Buscar, botón Expandir y filtros avanzados.
- Aplicación de la barra de búsqueda unificada en Tareas y Proyectos.
- Se eliminó la lógica de zona de trabajo / flujo de la vista principal de Tareas.
- Tareas y Proyectos migrados a una card vertical editable por columnas.
- Guardado por fila con acción directa al final de cada registro.

## Notas
- El guardado por fila actualiza directamente `tasks` y `projects` en Supabase desde el cliente.
- La nueva estructura privada del app vive bajo `src/app/(app)/app/` para conservar compatibilidad con el shell actual.
