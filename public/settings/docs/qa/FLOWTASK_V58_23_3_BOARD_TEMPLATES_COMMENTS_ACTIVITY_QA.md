# QA — v58.23.3 Board Templates + Comments Activity

## Migración

1. Ejecutar `supabase/migrations/0046_v58_23_3_board_templates_comments_activity.sql`.
2. Confirmar que existe `public.visual_board_comments`.
3. Confirmar que `visual_board_elements.type` permite `connector`.

## Plantillas

1. Ir a `/app/boards`.
2. Crear pizarra en blanco.
3. Crear pizarra con plantilla Diagrama de flujo.
4. Confirmar que aparecen elementos y conectores.
5. Crear pizarra con plantilla Plan de proyecto.
6. Confirmar tabla + nota + forma.
7. Recargar cada pizarra y confirmar persistencia.

## Comentarios

1. Abrir una pizarra.
2. Escribir comentario sin elemento seleccionado.
3. Seleccionar una nota/forma.
4. Escribir comentario con elemento seleccionado.
5. Confirmar que aparece en panel.
6. Recargar y confirmar que persiste.

## Actividad

1. Crear elemento nuevo.
2. Duplicar elemento.
3. Borrar elemento.
4. Agregar fila/columna a tabla.
5. Confirmar que los movimientos aparecen en Actividad.
