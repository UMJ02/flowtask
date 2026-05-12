# V58.1 — Organization Access Completion

Base usada: **V58.0 Organization Bootstrap & Consistency**

## Alcance
- completar el flujo real de organización
- dejar claro quién queda como owner/admin
- invitar miembros con validación de cupos y duplicados
- aceptar invitaciones pendientes desde la app
- endurecer actualización de roles desde ruta server-side
- mostrar mejor el contexto de capacidad y gobierno del workspace

## Cambios principales
- nueva migración `0029_v58_1_organization_access_completion.sql`
- nuevas rutas API:
  - `/api/organization/invites`
  - `/api/organization/invites/accept`
  - `/api/organization/members/update-role`
- nuevo card de invitaciones pendientes del usuario
- panel de miembros con owner protegido y snapshot de capacidad del plan
- formulario de invitaciones movido a flujo server-side
- bandeja de invitaciones movida a flujo server-side

## Resultado esperado
1. Un usuario sin organización puede crear su workspace.
2. El creador queda como owner/admin inicial.
3. El owner/admin puede invitar miembros desde la UI.
4. El invitado puede aceptar su invitación desde la app.
5. Los roles se actualizan desde server-side con validaciones reales.
6. El owner principal no puede perder su rol desde la vista rápida.
