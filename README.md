# FlowTask — V58.5 UX/UI Polish + Board Stabilization

Esta versión toma como base **V58.4** y se enfoca en pulir la experiencia del tablero visual sin romper la lógica existente del workspace.

## Objetivo
- estabilizar la pizarra visual para uso diario
- mejorar lectura y acciones del board
- reforzar persistencia y recuperación de estado
- dejar una base más sólida para próximas iteraciones de cliente final

## Qué cambia en la V58.5
- mejora de UX/UI en `interactive-dashboard-board.tsx`
- refresco manual del tablero
- reseteo seguro de la vista de board
- métricas rápidas del board en header
- agenda del día más clara y con acceso inline a la tarea
- persistencia local versionada a `flowtask.board.v585`
- nueva verificación `scripts/verify-v58.5.mjs`
- nuevo chequeo `scripts/board-stabilization-check.mjs`
- documentación de release actualizada a `V58.5`

## Scripts principales
- `npm run verify:v58.5`
- `npm run board:stability`
- `npm run verify:current`
- `npm run release:repo:current`

## Base de continuidad
Usa esta **V58.5** como nueva base 1:1 para seguir con iteraciones de cliente, UX/UI y cierre funcional del board.
