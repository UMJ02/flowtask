# FlowTask v2.0.0-control-tower

Base canónica actual sobre `v1.9.0-planning-center`, ahora con una capa nueva de **control operativo central** para leer foco inmediato, presión por cliente y señales de ejecución desde una sola vista.

## Estado de esta versión
- nueva ruta `/app/control-tower`
- nuevo centro de control operativo
- widget compacto en dashboard
- acceso desde navegación principal
- acceso desde command palette
- salida imprimible `control` en reportes

## Objetivo de esta versión
Dar una vista ejecutable y rápida para decidir qué atender primero sin tener que saltar entre tareas, proyectos, clientes y reportes.

## Incluye
- **Control Tower** con:
  - KPIs de operación inmediata
  - foco inmediato de tareas y proyectos
  - carriles de ejecución
  - señales por cliente
  - recomendaciones accionables
- **Nueva ruta** `/app/control-tower`
- **Widget compacto** dentro del dashboard
- **Nuevo PDF** en reportes con `type=control`

## Validación
- cambios contenidos y empaquetado limpio para descarga
- en este entorno no pude reejecutar una validación completa de `npm run typecheck`, así que no te la voy a vender como corrida confirmada cuando no la comprobé aquí

## Próxima versión sugerida
`v2.1.0`
- automatizaciones por reglas
- SLA por cliente y departamento
- centro de seguimiento con alertas más profundas
