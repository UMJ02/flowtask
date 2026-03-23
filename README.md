# FlowTask v3.0.0-workspace-os

Base canónica actual sobre `v2.3.0-execution-center`, ahora consolidada en una capa maestra **Workspace OS** para operar onboarding, planning, execution, intelligence y riesgo como un solo sistema.

## Estado de esta versión
- nueva ruta `/app/workspace-os`
- nuevo centro maestro de operación del workspace
- widget compacto en dashboard
- acceso desde navegación principal
- acceso desde command palette
- salida imprimible `os` en reportes

## Objetivo de esta versión
Acelerar el cierre profesional de segmentos sin seguir abriendo demasiadas subcapas, unificando la lectura ejecutiva en una sola experiencia de control.

## v2.1.1-stability-hotfix
- Corrige el fetch de preferencias de notificación para evitar 404 en cliente.
- Agrega endpoint de compatibilidad `GET /api/notification-preferences/me`.
- Endurece la estrategia del service worker para evitar hidratar con assets JS viejos en rutas SSR.
- Fuerza actualización del registro del service worker con `updateViaCache: 'none'`.


## v2.2.0-workspace-intelligence
- Nueva ruta `/app/workspace-intelligence`
- Nueva capa de lectura ejecutiva unificada
- Widget compacto en dashboard
- Acceso desde navegación y command palette
- Nueva salida imprimible `/app/reports/print?type=intelligence`


## Current release

### v2.3.0-execution-center
- nueva ruta `/app/execution-center`
- execution score con frentes `do now`, `unblock` y `monitor`
- team pulse por departamento
- widget compacto en dashboard
- acceso desde sidebar y command palette
- nuevo PDF en reportes: `/app/reports/print?type=execution`
