# FlowTask v6.0.0-product-polish

Base validada sobre `v5.9.1-core-hardening`.

## Objetivo
Subir la experiencia general del producto para que la app se sienta más clara, más premium y más consistente sin tocar la lógica sensible de operación.

## Enfoque
- Pulir shell, header, footer y estados globales
- Hacer más consistentes los encabezados y señales visuales de los módulos core
- Ordenar mejor la salida de reportes y reforzar la sensación de producto terminado

## Scripts
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run typecheck`

## Cambios clave
- Se mejora la superficie visual del shell general, header y footer
- `SectionHeader`, `EmptyState`, `ErrorState` y `LoadingState` reciben polish visual reutilizable
- Workspace, Projects, Tasks, Clients e Intelligence ganan badges de contexto para una lectura más consistente
- Reports se reordena con una salida más limpia y más clara para PDF y CSV
- Se actualiza documentación y versionado a `v6.0.0-product-polish`
