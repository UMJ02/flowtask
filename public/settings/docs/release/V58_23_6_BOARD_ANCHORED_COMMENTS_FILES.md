# v58.23.6 — Board Anchored Comments + Files

Base: v58.23.5 Board History + Shortcuts + Minimap.

## Objetivo
Agregar comentarios anclados visualmente al lienzo y soporte de imágenes/archivos dentro de las pizarras, manteniendo el modelo flexible `visual_board_elements`.

## Incluye
- Herramienta Comentario para anclar conversaciones al lienzo o a un elemento.
- Pins visuales de comentarios no resueltos dentro del canvas.
- Herramientas Imagen y Archivo en el panel de Pizarras.
- Upload a Supabase Storage bucket `visual-board-files`.
- Elementos `image` y `file` persistidos en `visual_board_elements`.
- Render de imágenes y cards de archivo dentro del canvas.
- Panel de propiedades con metadatos de archivo y acción Abrir.
- Migración `0048_v58_23_6_board_anchored_comments_files.sql`.

## No incluye todavía
- Resolución completa de hilos de comentarios.
- Eliminación física automática del archivo en Storage al borrar el elemento.
- Versionado de archivos.
