# FlowTask — V58.11 Workspace Polish and Invite Flow Fix

Base completa y actualizada para continuidad sobre **V58.10.9**, enfocada en pulido del dashboard/organización, disclosure más limpio y corrección del flujo de invitaciones.

## Qué cambia en la V58.11
- versión y metadata alineadas a `V58.11`
- nuevo `scripts/verify-v58.11.mjs`
- nuevo release doc `docs/release/V58_11_WORKSPACE_POLISH_AND_INVITE_FLOW_FIX.md`
- se retira el card de inicio rápido del dashboard
- permisos del cliente e invitaciones quedan contraídos por defecto y se abren bajo acción del usuario
- bitácora mantiene apertura manual con estética más limpia
- paleta y copy del módulo organización más sobrios y alineados con FlowTask
- envío de invitaciones con manejo idempotente cuando ya existe una invitación pendiente

## Validación sugerida
- `npm run verify:v58.11`
- `npm run typecheck`
- `npm run deploy:readiness`
- `npm run build:preflight`

## Continuidad
Usa esta **V58.11** como base oficial para seguir puliendo la experiencia de organización. La app continúa sobre el proyecto actual y la base de datos sigue regida por la cadena real de migraciones dentro de `supabase/migrations`.
