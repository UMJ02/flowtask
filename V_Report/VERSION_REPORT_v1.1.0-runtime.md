# FlowTask v1.1.0-runtime

## Objetivo
Cerrar la capa de funcionamiento real flujo por flujo sobre la base `v1.0.0-canon`, endureciendo páginas, queries y navegación para que el proyecto se comporte mejor en escenarios reales.

## Cambios principales
- Normalización de `searchParams` para tareas, proyectos y clientes.
- Scoping consistente por usuario/organización para listados y detalles de tareas y proyectos.
- Hardening de queries críticas con manejo defensivo de errores y fallbacks vacíos.
- Dashboard ajustado para consumir la nueva capa de scoping y seguir renderizando con datos parciales.
- Detail pages de tareas y proyectos con validación explícita de `id`.
- Nuevas vistas globales de `error` y `not-found` para mejorar la experiencia en runtime.
- Corrección adicional de tipado en `reminders/page.tsx`.

## Validación ejecutada
- `tsc --noEmit`: OK
- `next build`: no verificable dentro del contenedor por bloqueo externo de SWC/registry, no por error confirmado del código.

## Riesgos pendientes
- Falta validar manualmente contra una base Supabase real los flujos end-to-end de inserción, edición y permisos.
- Build productivo sigue dependiendo de resolver SWC en un entorno real o CI normal.

## Base de continuidad
Esta versión sustituye a `v1.0.0-canon` como nueva base operativa para la siguiente fase.
