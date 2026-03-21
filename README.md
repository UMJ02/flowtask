# FlowTask

Base v9.1 con multi-empresa, roles avanzados, dashboard por organización e invitaciones de equipo.

## Novedades v9.1
- Organización: métricas consolidadas por empresa
- Invitaciones por correo con rol sugerido
- Panel de organización con equipo, permisos por cliente e invitaciones
- Migration `0013_organization_invites.sql`

## Puesta en marcha
1. `npm install`
2. corre las migrations en `supabase/migrations`
3. `npm run dev`


## v9.2
- roles dinámicos por organización
- permisos granulares por acción
- pantalla `/app/organization/roles`
- migration `0014_roles_permissions.sql`


## v9.3
- módulo de clientes por organización
- dashboard por cliente
- páginas /app/clients y /app/clients/[id]
- migration 0015_clients_workspace.sql
