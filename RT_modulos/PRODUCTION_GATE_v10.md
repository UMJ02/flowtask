# Production Gate v10

## Solo desplegar si:
- Login, dashboard, tareas y proyectos están validados
- No hay bugs críticos abiertos
- Build termina correctamente
- Variables de entorno están configuradas
- Endpoints de salud responden
- La navegación principal no pierde contexto

## No desplegar si:
- CRUD de tareas falla
- CRUD de proyectos falla
- Auth redirige incorrectamente
- Existen errores runtime visibles
- El build rompe
