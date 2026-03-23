# FlowTask v1.9.0-planning-center

Base canónica actual con enfoque en **onboarding real del workspace, readiness operacional y activación guiada** sobre la línea `v1.7.0-executive-insights`.

## Estado de esta versión
- typecheck validado en cero
- nueva capa de onboarding del workspace con score real de readiness
- checklist maestro para base, operación y automatización
- recomendaciones accionables según faltantes del entorno
- acceso al onboarding desde dashboard, settings y navegación principal

## Objetivo de esta versión
Convertir el arranque del workspace en un flujo visible, guiado y medible para dejar de depender de memoria o de revisiones manuales.

## Incluye
- **Centro de onboarding** dentro del workspace con:
  - score de readiness
  - checklist maestro
  - recomendaciones accionables
  - pulso operativo básico
- **Nueva ruta** `/app/onboarding`
- **Widget compacto** de onboarding en dashboard y settings
- **Base lista** para continuar con centro administrativo, gobierno operativo o automatizaciones más profundas

## Validación
- `npm run typecheck` en cero
- build compilado correctamente en etapa de bundling; en este entorno no confirmé el cierre final del proceso completo de `next build`, así que la validación firme de esta versión queda en typecheck

## Próxima versión sugerida
`v1.9.0`
- centro administrativo más profundo
- gobierno operativo y SLA por equipo
- plantillas de arranque por tipo de organización
- automatizaciones externas más cerradas


## v1.9.0-planning-center

- nueva ruta `/app/planning`
- centro de planificación con foco de 14 días
- capacidad por departamento
- clientes con más movimiento
- widget compacto en dashboard
- salida imprimible `planning` en reportes
