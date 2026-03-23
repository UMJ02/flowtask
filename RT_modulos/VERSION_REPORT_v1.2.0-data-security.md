# VERSION REPORT — v1.2.0-data-security

## Objetivo
Cerrar la capa de seguridad de datos para que el workspace multi-tenant tenga menos exposición accidental y una política CRUD más consistente.

## Cambios principales
- Se agregó `src/lib/security/organization-access.ts` para centralizar membresía activa y capacidades por rol.
- `getOrganizationContext()` ya no consulta permisos de todos los usuarios del tenant; ahora solo devuelve permisos del usuario autenticado.
- `getOrganizationInvites()` y `getOrganizationRolesAndPermissions()` ahora requieren capacidad explícita de gestión.
- `GET /api/organization/roles` devuelve 403 cuando el usuario no es `admin_global` o `manager`.
- `POST /api/organization/invites` ahora valida email, rol permitido, duplicados pendientes y evita que un manager invite a otro manager.
- Se agregó `0018_data_security_hardening.sql` con funciones helper, índices y políticas RLS para CRUD sensible.

## Enfoque
Esta versión no agrega features nuevas. Endurece acceso, visibilidad y coherencia de permisos.
