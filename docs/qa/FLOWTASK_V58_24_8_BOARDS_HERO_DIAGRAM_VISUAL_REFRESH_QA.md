# QA — v58.24.8 Boards Hero Diagram Visual Refresh

## Objetivo de QA
Confirmar que el hero de `/app/boards` conserva su estructura y reemplaza únicamente la ilustración decorativa por un visual de diagrama más estético.

## Revisar
- El título y subtítulo del hero no cambian.
- Los botones `Nueva pizarra` y `Ver plantillas` siguen funcionando.
- El bloque visual derecho muestra el nuevo diagrama.
- El cambio no rompe spacing, bordes ni layout responsive.
- El editor `/app/boards/[boardId]` sigue intacto.
- La ruta pública `/share/boards/[token]` sigue intacta.
