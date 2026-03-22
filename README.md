# FlowTask v1.5.0-automation

Base canónica actual con enfoque en **visibilidad operativa, automatización y seguimiento** sobre la línea `v1.4.0-productivity`.

## Estado de esta versión
- `tsc --noEmit` validado en cero errores
- timeline de actividad del dashboard conectado a datos reales
- centro de automatización en settings con lectura clara de canales, frecuencia y horas silenciosas
- salud de entregas y digest más visible dentro del centro de notificaciones
- sin romper routing, runtime, seguridad, UX ni productividad de versiones previas

## Objetivo de esta versión
Dar visibilidad real al pulso del workspace y dejar más clara la capa de automatizaciones para que el equipo entienda qué está pasando, qué se está enviando y qué tan lista está la app para crecer hacia canales externos y onboarding.

## Incluye
- **Dashboard con actividad real**: el bloque de actividad reciente ahora usa `activity_logs` reales con conteos y timeline reutilizable
- **Automation center**: resumen visual del estado de preferencias, horarios silenciosos y canales activos en settings
- **Health de notificaciones**: lectura rápida de entregas enviadas, pendientes, fallidas y digest más reciente
- **Timeline mejorado**: badges por entidad, detalle de metadata y presentación más clara en tareas, proyectos y dashboard

## Próxima versión
`v1.6.0`
- onboarding inicial por organización
- activación guiada de canales externos
- reglas operativas por workspace y checklists de arranque
