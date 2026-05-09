# FlowTask Boards Foundation

El módulo Boards/Pizarras es el primer MVP del lienzo visual de FlowTask.

## Tablas

- `visual_boards`: pizarras visuales.
- `visual_board_elements`: elementos del canvas.
- `visual_board_activity`: actividad básica del módulo.

## Elementos MVP

- sticky
- text
- shape
- table

## Guardado

El canvas usa estado local para respuesta inmediata y autosave con debounce para persistir en Supabase.

## Razón del prefijo visual_

FlowTask ya usa `public.boards` para la configuración del dashboard. Para no romper esa función, este módulo usa `visual_boards`.
