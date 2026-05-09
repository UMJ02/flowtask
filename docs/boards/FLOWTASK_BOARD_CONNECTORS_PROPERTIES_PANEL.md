# FlowTask Boards — Connectors + Properties Panel

Los conectores son elementos persistentes del canvas. Se guardan en `visual_board_elements` igual que notas, textos, formas y tablas.

## Modelo

- `type`: `connector`
- `data.from`: punto inicial
- `data.to`: punto final
- `data.fromElementId`: elemento origen opcional
- `data.toElementId`: elemento destino opcional
- `data.label`: etiqueta opcional
- `style.stroke`: color
- `style.strokeWidth`: grosor
- `style.lineType`: `straight`, `elbow`, `curve`
- `style.arrowEnd`: boolean

## UX

La herramienta conector trabaja en dos pasos:

1. Elegir punto o elemento origen.
2. Elegir punto o elemento destino.

`Esc` cancela la creación pendiente.
