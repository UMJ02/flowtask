# FlowTask — V58.6 Functional Closeout + Client Readiness

Esta versión toma como base **V58.5** y consolida el board para uso real de cliente sin rehacer la arquitectura existente.

## Objetivo
- cerrar el flujo funcional diario sobre tareas reales
- dejar la agenda visible orientada a favoritas
- permitir cierre rápido de tareas desde el board
- mantener la base estable para demo, QA y entrega cliente

## Qué cambia en la V58.6
- board actualizado a persistencia local `flowtask.board.v586`
- agenda del calendario con acciones reales: abrir tarea, abrir proyecto y completar
- panel lateral “Lo que sigue hoy” ahora muestra tareas destacadas reales
- CTA para agregar la tarea recién creada a la agenda visible
- cierre rápido de tareas desde board con actualización a base de datos
- nueva verificación `scripts/verify-v58.6.mjs`
- nuevo chequeo `scripts/client-readiness-check.mjs`
- documentación de release actualizada a `V58.6`

## Scripts principales
- `npm run verify:v58.6`
- `npm run client:readiness:check`
- `npm run verify:current`
- `npm run release:repo:current`

## Base de continuidad
Usa esta **V58.6** como nueva base 1:1 para seguir con cierre de deploy, QA final y bundle cliente.
