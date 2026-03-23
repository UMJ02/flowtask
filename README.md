# FlowTask v1.7.0-executive-insights

Base canónica actual con enfoque en **lectura ejecutiva, capacidad por departamento y watchlist de proyectos** sobre la línea `v1.6.0-operations`.

## Estado de esta versión
- typecheck validado en cero
- módulo de reportes ampliado con capa ejecutiva real
- nuevos KPIs para semana actual, tareas en espera y proyectos vencidos
- nueva vista de capacidad por departamento
- watchlist de proyectos para seguimiento de riesgo
- nueva salida imprimible `executive` para PDF

## Objetivo de esta versión
Dar una lectura todavía más útil para dirección, coordinación y seguimiento semanal sin salir del workspace, con foco en capacidad, riesgo y prioridades inmediatas.

## Incluye
- **Executive insights** dentro de reportes con:
  - ventana crítica
  - capacidad por departamento
  - watchlist de proyectos
- **Nuevos KPIs**:
  - tareas de esta semana
  - tareas en espera
  - proyectos vencidos
- **Nuevo reporte imprimible ejecutivo** para compartir estado con jefatura o clientes internos
- **Base lista** para continuar con onboarding, centro administrativo o automatizaciones más profundas

## Validación
- `npm run typecheck` en cero
- build compilado correctamente en etapa de bundling; en este entorno no confirmé el cierre final del proceso completo de `next build`, así que la validación firme de esta versión queda en typecheck

## Próxima versión sugerida
`v1.8.0`
- onboarding por organización
- checklist de arranque del workspace
- activación guiada de canales externos
- centro administrativo más profundo
