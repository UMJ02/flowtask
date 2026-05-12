# FlowTask Board Visual Polish + Toolbar System

La toolbar del editor de pizarras debe comportarse como una paleta profesional: flotante, movible, colapsable, ocultable y visualmente limpia.

## Reglas

- Usar icono + texto en modo expandido.
- Usar solo iconos en modo colapsado.
- Mantener tooltips nativos vía `title`.
- Guardar modo y posición en `localStorage`.
- No usar controles HTML nativos en modales del módulo Board.
- Mantener acciones peligrosas con estilo destructivo claro.

## Tokens visuales

- Panel: `#FFFFFF` / borde `#E8EDF5`.
- Canvas: `#F8FAFC`.
- Activo: `#ECFDF3` / `#047857`.
- Destructivo: `#E11D48`.
