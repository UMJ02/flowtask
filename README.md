# FlowTask — V58.10.6 Workspace Switch Personal + Organization

Esta versión toma como base **V58.10.5** y deja el proyecto listo para trabajar con un comportamiento moderno de workspace: el usuario puede conservar su **modo personal** y, al mismo tiempo, crear o participar en una **organización** sin perder acceso a lo que ya tenía.

## Objetivo
- mantener el workspace personal siempre disponible
- permitir alternar entre espacio personal y organizaciones
- corregir el contexto activo para que crear un equipo no oculte tareas y proyectos individuales
- alinear el scoping de datos a `organization_id = null` en modo personal
- conservar la continuidad técnica ya saneada en V58.10.5

## Qué cambia en la V58.10.6
- versión y metadata alineadas a `V58.10.6`
- nuevo `scripts/verify-v58.10.6.mjs`
- nuevo release doc `docs/release/V58_10_6_WORKSPACE_SWITCH_PERSONAL_ORGANIZATION.md`
- nuevo endpoint `POST /api/workspace/active` para persistir el workspace activo
- selector de workspace actualizado con opción **Workspace personal** + organizaciones
- `getWorkspaceContext` y `getClientWorkspaceContext` respetan la preferencia activa
- queries personales de tareas/proyectos vuelven a filtrar por `organization_id = null`
- crear o aceptar una organización activa el workspace de equipo, pero permite volver al personal desde el selector

## Scripts principales
- `npm run verify:v58.10.6`
- `npm run verify:current`
- `npm run release:repo:current`

## Base de continuidad
Usa esta **V58.10.6** como base oficial para depurar el cambio entre modo individual y organización. La app continúa sobre el proyecto actual y la base de datos sigue regida por la cadena real de migraciones dentro de `supabase/migrations`.

## Continuidad técnica incorporada
- se preserva todo lo saneado en `V58.10.5`
- se agrega la capa de workspace switch sin rehacer estructura
- se mantiene la separación entre datos personales y organizacionales para futuras mejoras de UX/UI
