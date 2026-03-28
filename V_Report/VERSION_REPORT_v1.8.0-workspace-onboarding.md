# FlowTask v1.8.0-workspace-onboarding

## Objetivo
Agregar una capa real de **onboarding y readiness del workspace** para que la adopción y el cierre operativo no dependan de memoria o revisión manual.

## Incluye
- nueva ruta `/app/onboarding`
- nuevo query `getWorkspaceOnboardingSummary()`
- checklist maestro con pasos por base, operación y automatización
- score de readiness del workspace
- recomendaciones accionables según faltantes reales
- integración compacta del onboarding en dashboard y settings
- acceso desde navegación principal

## Señales que evalúa
- perfil listo
- organización activa
- clientes cargados
- proyectos existentes
- tareas registradas
- roles/permisos con base mínima
- automatizaciones básicas activas

## Validación
- `npm run typecheck` en cero
