# v58.25.6.4.1 — Kanban Overflow + Compact Action Fix

**Base:** v58.25.6.4 — Organization + Settings + Notifications UI System Final Alignment

## Problema

En Kanban, los cards de tareas quedaban visualmente desbordados porque la fila inferior tenía fecha + varias acciones circulares en una sola línea sin contención. En columnas estrechas, los botones empujaban el contenido fuera del card.

## Fix

- `ft-kanban-card-actions`: layout interno seguro con grid.
- `ft-kanban-date-pill`: fecha compacta y con ancho máximo.
- `ft-kanban-action-strip`: contenedor de acciones con overflow horizontal interno.
- `ft-kanban-action-button`: botones compactos, con ancho fijo.
- Breakpoint 1280–1535px: reduce padding, fecha y botones para evitar overflow en pantallas medianas.
- Mobile: acciones pasan debajo de la fecha.

## Funcionalidad preservada

- Drag/drop.
- Cambiar estado con iconos.
- Marcar/quitar importante.
- Abrir tarea.
- Columnas por estado.
- Orden local/persistido.
