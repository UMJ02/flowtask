# v58.23.2 — Board Tables + Inline Editing

Base: v58.23.1 Board Connectors + Properties Panel.

## Objetivo

Mejorar las tablas visuales del módulo Pizarras para que sean elementos editables dentro del canvas y no solo previews estáticos.

## Cambios

- Las tablas del canvas permiten edición inline por celda.
- El usuario puede agregar filas desde la tabla seleccionada.
- El usuario puede agregar columnas desde la tabla seleccionada.
- El usuario puede eliminar filas desde la tabla seleccionada.
- El panel de propiedades permite renombrar columnas.
- El panel de propiedades permite eliminar columnas con protección mínima: queda al menos una columna.
- La toolbar flotante muestra acciones rápidas para tablas: Fila y Columna.
- Las celdas se guardan dentro de `visual_board_elements.data.rows`.
- Las columnas se guardan dentro de `visual_board_elements.data.columns`.
- No se agregan tablas nuevas ni migraciones Supabase.
- No se toca RLS.

## Criterio de aceptación

- Crear una tabla en una pizarra.
- Editar varias celdas inline.
- Agregar fila y columna.
- Renombrar columna desde propiedades.
- Eliminar fila y columna.
- Recargar y confirmar que la tabla persiste igual.
