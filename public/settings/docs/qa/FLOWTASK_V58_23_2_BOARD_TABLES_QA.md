# QA — v58.23.2 Board Tables + Inline Editing

## Rutas

- `/app/boards`
- `/app/boards/[boardId]`

## Pruebas manuales

1. Crear o abrir una pizarra.
2. Seleccionar herramienta Tabla.
3. Hacer clic en el canvas.
4. Editar una celda directamente.
5. Confirmar que no se arrastra la tabla al escribir.
6. Seleccionar la tabla.
7. Usar toolbar flotante > Fila.
8. Usar toolbar flotante > Columna.
9. Abrir panel Propiedades.
10. Renombrar una columna.
11. Eliminar una fila.
12. Eliminar una columna.
13. Recargar la página.
14. Confirmar que filas, columnas y celdas persisten.

## Supabase

La tabla editable usa el modelo flexible existente:

- `visual_board_elements.type = 'table'`
- `visual_board_elements.data.columns`
- `visual_board_elements.data.rows`

No hay migración nueva.
