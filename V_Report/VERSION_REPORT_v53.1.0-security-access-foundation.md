# FlowTask V53.1.0 — Security & Access Foundation

## Base
Se trabajó sobre el ZIP entregado como base del proyecto actual.

## Cambios clave
- Separación real entre admin de organización y admin de plataforma.
- Endurecimiento de funciones helper RLS con `security definer` y grants explícitos.
- Nuevo hardening para impedir escalamiento de `manager` hacia `admin_global` en miembros e invitaciones.
- Refuerzo de `client_permissions` con validación de rol destino.
- Integridad relacional reforzada para `projects` y `tasks` respecto a `organization_id`, `client_id` y `project_id`.
- Adjuntos alineados con `owner_id` y políticas seguras de storage.
- Filtros efectivos por permisos de cliente en consultas de clientes, proyectos y tareas.
- Endpoints `/api/health` y `/api/ready` reducidos para no exponer estado sensible interno.

## Archivos clave tocados
- `supabase/migrations/0019_v53_1_security_access_foundation.sql`
- `src/lib/security/client-access.ts`
- `src/lib/security/organization-access.ts`
- `src/lib/queries/admin.ts`
- `src/lib/queries/clients.ts`
- `src/lib/queries/projects.ts`
- `src/lib/queries/tasks.ts`
- `src/lib/queries/attachments.ts`
- `src/lib/supabase/workspace-client.ts`
- `src/components/projects/project-form.tsx`
- `src/components/tasks/task-form.tsx`
- `src/components/attachments/entity-attachments.tsx`
- `src/app/api/health/route.ts`
- `src/app/api/ready/route.ts`

## Validación
- `npm run typecheck` OK

## Nota operativa
Después de aplicar esta versión, los accesos a plataforma requieren que el usuario exista en `platform_admins` con:
- `active = true`
- `grant_source = 'manual'`

Los registros heredados marcados como `legacy_bootstrap` dejan de otorgar acceso global.
