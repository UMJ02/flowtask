# FlowTask Boards — Templates + Comments Activity

Esta versión agrega una capa de arranque rápido y seguimiento al módulo Pizarras.

## Plantillas

Las plantillas viven en:

- `src/lib/boards/board-templates.ts`

Cada plantilla genera elementos iniciales sobre el modelo flexible de `visual_board_elements`.

## Comentarios

Los comentarios viven en:

- `public.visual_board_comments`

Pueden ser generales de la pizarra o ligados a un elemento mediante `element_id`.

## Actividad

La actividad continúa usando:

- `public.visual_board_activity`

Se registra actividad básica para crear board, aplicar plantilla, crear elemento, duplicar, borrar, comentar y cambios de tabla.
