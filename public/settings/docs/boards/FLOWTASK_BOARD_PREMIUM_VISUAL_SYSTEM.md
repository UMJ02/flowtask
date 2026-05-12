# FlowTask Board Premium Visual System

## Principios

- El canvas es protagonista.
- Los controles flotan con baja fricción visual.
- Los paneles usan glass suave solo donde aporta jerarquía.
- Los botones evitan estilos nativos y usan roles consistentes.
- El motion es sutil: hover, press, popover y selected states.

## Clases clave

- `board-shell`
- `board-editor-main`
- `board-topbar`
- `board-icon-button`
- `board-present-button`
- `board-share-button`
- `board-tool-palette`
- `board-tooltip`
- `board-inspector`
- `board-inspector-section`
- `board-input`
- `board-zoom-controls`
- `board-selection-ring`

## Reglas

No agregar estilos sueltos para nuevos controles de Pizarra. Extender el sistema visual existente con clases `board-*` y mantener motion entre 160ms y 220ms salvo casos justificados.
