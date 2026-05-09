# v58.23.0 — Boards Foundation + Visual Canvas MVP

Base: v58.22.4 Data Sync Reliability + Mutation Confirmation.

## Objetivo

Agregar el primer MVP real del módulo **Pizarras** dentro de FlowTask: un espacio visual para crear pizarras, insertar notas, textos, formas y tablas, mover elementos en un canvas punteado y guardar automáticamente en Supabase.

## Incluye

- Ruta `/app/boards` para listar y crear pizarras.
- Ruta `/app/boards/[boardId]` para abrir el canvas visual.
- Nuevo namespace de datos `visual_boards`, `visual_board_elements` y `visual_board_activity`.
- RLS básico para dueño y miembros de organización.
- Canvas punteado con herramientas básicas.
- Elementos MVP: nota adhesiva, texto, forma y tabla visual.
- Selección, movimiento, edición inline de texto, duplicar y borrar.
- Autosave con debounce sobre elementos y título.
- Persistencia real: recargar conserva la pizarra.
- Navegación lateral con acceso a Pizarras.

## Fuera de alcance para esta versión

- Conectores SVG avanzados.
- Colaboración realtime.
- Comentarios anclados.
- Plantillas.
- Minimap avanzado.
- Imágenes/archivos dentro del canvas.
- Compartir público completo.

## Nota de arquitectura

El proyecto ya tenía una tabla `public.boards` para layout del dashboard. Para evitar conflictos, este módulo usa tablas nuevas con prefijo `visual_`.
