# FlowTask v1.1.0-runtime

Base canónica actual con enfoque en **runtime hardening** sobre la línea `v1.0.0-canon`.

## Estado de esta versión
- `tsc --noEmit` en cero errores
- filtros y `searchParams` normalizados en tareas, proyectos y clientes
- scoping consistente por usuario/organización para listados y detalles
- dashboard endurecido con consultas alineadas al workspace
- páginas de detalle con validación de `id`
- pantallas globales de `error` y `not-found`
- base lista para continuar con validación funcional más profunda

## Objetivo de esta versión
Cerrar la capa de funcionamiento real para evitar rupturas por navegación, parámetros, vistas vacías y consultas fuera de scope.

## Próxima versión
`v1.2.0-data-security`
- validación de RLS por flujo
- revisión de permisos por organización/rol
- consistencia entre front, queries y migrations
