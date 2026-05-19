# FlowTask v58.28.21 — Supabase / RLS / Client Readiness QA

## Objetivo
Validar que la app queda lista para cliente final con Supabase real, RLS activo, estados finales y separación correcta entre workspace personal y workspace organización.

## Variables requeridas en Vercel
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FLOWTASK_BASE_URL`
- `NEXT_PUBLIC_ENABLE_REALTIME`

Opcionales:
- `CRON_SECRET`
- `DIGEST_TIMEZONE`
- `NOTIFICATION_BATCH_SIZE`

## SQL obligatorio
Ejecutar `docs/sql/V58_28_21_SUPABASE_RLS_CLIENT_READINESS.sql` en Supabase.

Confirmar:
- `tasks_status_check` incluye `pendiente`, `en_proceso`, `produccion`, `en_espera`, `revision`, `concluido`.
- RLS está activo en `tasks`, `projects`, `visual_boards`, `attachments`, `organizations`, `organization_members`, `workspace_spaces`, `workspace_space_projects`, `project_views`.
- `pg_policies` muestra políticas para workspace personal y workspace organización.
- No existen tareas con estados inesperados.
- No existen tareas cuyo `organization_id` sea distinto al del proyecto asociado.

## QA con usuario real
1. Login como usuario A.
2. Crear tarea personal.
3. Cambiar estado a Pendiente, En curso, Producción, En espera, Revisión y Concluido.
4. Confirmar que clásico y Pro muestran los mismos estados.
5. Crear proyecto personal y mover una tarea a ese proyecto.
6. Crear pizarra y validar que solo el usuario A la ve.
7. Login como usuario B y confirmar que no ve datos personales del usuario A.
8. Crear organización con usuario A.
9. Invitar/agregar usuario B como miembro.
10. Confirmar que usuario B ve solo datos de esa organización y no datos personales del usuario A.
11. Cambiar entre workspace personal y organización; no debe mezclarse información.
12. Validar Workspace Pro y clásico con los mismos datos.

## Criterio de aprobación
- Build y Vercel pasan.
- `npm audit --audit-level=moderate` queda limpio.
- SQL de estados/RLS pasa sin hallazgos críticos.
- Clásico y Pro muestran datos consistentes.
- User A no ve datos personales de User B.
- Workspace personal y organización no mezclan tareas, proyectos ni pizarras.
