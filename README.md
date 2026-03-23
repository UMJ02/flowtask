# FlowTask v2.1.0-risk-radar

Base canónica actual sobre `v2.0.0-control-tower`, ahora con una capa nueva de **lectura de riesgo operativo** para ver vencimientos, presión por cliente y hotspots por departamento sin salir del workspace.

## Estado de esta versión
- nueva ruta `/app/risk-radar`
- nuevo centro de riesgo operativo
- widget compacto en dashboard
- acceso desde navegación principal
- acceso desde command palette
- salida imprimible `risk` en reportes

## Objetivo de esta versión
Dar una vista ejecutiva y accionable del riesgo real del workspace antes de que los bloqueos se conviertan en atrasos mayores.

## Incluye
- **Risk Radar** con:
  - risk score global
  - buckets de riesgo
  - hotspots por departamento
  - watchlist de proyectos
  - clientes con presión operativa
  - recomendaciones accionables
- **Nueva ruta** `/app/risk-radar`
- **Widget compacto** dentro del dashboard
- **Nuevo PDF** en reportes con `type=risk`

## Validación
- `npm run typecheck` validado en cero dentro del entorno de trabajo usando las dependencias restauradas del proyecto original
- ZIP limpio para descarga

## Próxima versión sugerida
`v2.2.0`
- reglas automáticas por SLA
- alertas por dueño/departamento
- centro de seguimiento con automatizaciones más profundas


## v2.1.1-stability-hotfix
- Corrige el fetch de preferencias de notificación para evitar 404 en cliente.
- Agrega endpoint de compatibilidad `GET /api/notification-preferences/me`.
- Endurece la estrategia del service worker para evitar hidratar con assets JS viejos en rutas SSR.
- Fuerza actualización del registro del service worker con `updateViaCache: 'none'`.
