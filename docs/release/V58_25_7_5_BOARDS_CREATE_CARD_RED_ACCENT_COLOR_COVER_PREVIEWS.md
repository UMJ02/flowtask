# v58.25.7.5 — Boards Create Card Red Accent + Color Cover Previews

## Base

v58.25.7.4 — Boards Delete RPC + Asset Fallback Fix

## Objetivo

Refinar la vista de Pizarras recientes para que las pizarras creadas no dependan de imágenes/miniaturas y usen color visual por pizarra. También destacar la acción de crear pizarra con un plus rojo.

## Cambios

- Card `Crear nueva pizarra` con acento rojo.
- Plus rojo como acción principal.
- Pizarras recientes dejan de usar imagen fallback.
- Cada pizarra recibe un color determinístico según `id + title`.
- Cover visual por color con:
  - acento lateral del card
  - mini preview abstracto
  - iniciales de la pizarra
  - líneas y grid suave
- No requiere migración de BD.
