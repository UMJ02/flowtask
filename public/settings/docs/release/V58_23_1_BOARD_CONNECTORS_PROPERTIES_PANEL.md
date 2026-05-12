# v58.23.1 — Board Connectors + Properties Panel

Base: v58.23.0 Boards Foundation + Visual Canvas MVP
Stage: production-candidate

## Incluye

- Nueva herramienta **Conector** dentro del toolbox de pizarras.
- Creación de conectores desde elemento a elemento o desde punto a punto en el lienzo.
- Capa SVG `ConnectorLayer` para renderizar líneas, codos, curvas, flechas y etiquetas.
- Los conectores se persisten como `visual_board_elements` con `type = connector`.
- El panel de propiedades ahora permite editar:
  - color de línea
  - grosor
  - tipo de línea: recta, codo o curva
  - flecha final
  - etiqueta del conector
  - bloqueo
- Los elementos conectados actualizan el punto del conector al moverse.
- No agrega nuevas tablas ni cambia RLS.

## No incluido todavía

- Autoconexión inteligente con handles visibles.
- Resize de conectores con handles.
- Undo/redo robusto.
- Comentarios o colaboración realtime.
