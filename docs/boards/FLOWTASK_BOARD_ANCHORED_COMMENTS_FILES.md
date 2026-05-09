# FlowTask Boards — Anchored Comments + Files

Los comentarios ahora pueden anclarse a coordenadas del lienzo o a un elemento. Las imágenes y archivos se guardan como elementos visuales, usando Storage para el binario y `visual_board_elements.data` para metadatos.

## Elementos nuevos
- `image`: `{ name, size, mime, path, url, bucket }`
- `file`: `{ name, size, mime, path, url, bucket }`

## Storage
Bucket: `visual-board-files`

## UX
- Comentario: herramienta `C`, clic en lienzo/elemento, escribir en panel.
- Imagen: herramienta `I`, clic en lienzo, seleccionar archivo.
- Archivo: herramienta `F`, clic en lienzo, seleccionar archivo.
