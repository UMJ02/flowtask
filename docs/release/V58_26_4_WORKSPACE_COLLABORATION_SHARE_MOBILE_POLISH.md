# FlowTask v58.26.4 — Workspace Collaboration + Share + Mobile Polish

## Objetivo

Cerrar la primera capa colaborativa del Workspace System sin agregar migraciones nuevas ni modificar RLS.

## Cambios principales

- Nuevo `WorkspaceSharePanel`.
- Botón `Compartir` en `WorkspaceContextHeader`.
- Botón `Compartir` en toolbar mobile de `/app/workspace`.
- Copia de links internos para:
  - Workspace Home.
  - Proyecto activo.
  - Vista activa.
  - Vista guardada activa.
  - Vistas guardadas del proyecto.
- UX de miembros y roles dentro del panel.
- Mensajes claros para modo solo lectura, compartir limitado y gestión de acceso bloqueada.
- CSS responsive para share panel, rows de links y miembros.

## Reglas mantenidas

- No se agregan migraciones.
- No se modifica RLS.
- No se reemplazan rutas clásicas.
- No se duplica BoardPage.
- Los links no saltan permisos: el acceso sigue protegido por Supabase/RLS.

## Validación

```bash
npm run workspace:collaboration:ready
npm run verify:current
npm run build:preflight
```
