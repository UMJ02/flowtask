# FlowTask Board Editor UX Hardening

Esta versión endurece el comportamiento del editor visual de Pizarras para acercarlo a una herramienta profesional tipo canvas/editor.

## Decisiones UX
- Un solo sidebar global de FlowTask fuera del editor.
- Paleta compacta interna para herramientas del lienzo.
- Herramientas secundarias bajo menú Más para evitar scroll y saturación.
- Edición precisa en panel derecho: posición, tamaño, forma y tabla.
- Comentarios como objetos interactivos del canvas: mover, editar, resolver, borrar.
- Resize común para elementos visuales.
- Conectores editables desde canvas y panel.

## Persistencia
No cambia el esquema de datos. Los cambios se guardan mediante autosave sobre los mismos campos flexibles de visual_board_elements y visual_board_comments.
