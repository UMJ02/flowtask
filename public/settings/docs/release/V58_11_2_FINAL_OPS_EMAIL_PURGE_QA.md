# V58.11.2 — Final Ops / Email / Purge / QA

## Objetivo
Cerrar la base de salida final con tres piezas operativas:

1. Purga automática real de organizaciones vencidas.
2. Flujo de correo de invitaciones con diagnóstico más claro.
3. Checklist de QA final para producción.

## Cambios principales
- nueva ruta cron: `src/app/api/cron/organization-purge/route.ts`
- nueva lógica centralizada: `src/lib/organization/purge.ts`
- script manual de purga: `scripts/process-organization-purges.ts`
- mejora en helper de email: `src/lib/email/resend.ts`
- script de cierre final: `scripts/qa-final-v58.11.2.mjs`
- `vercel.json` ahora agenda la purga automática diaria

## Variables clave
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`
- `RESEND_API_KEY`
- `INVITE_EMAIL_FROM` o `RESEND_FROM_EMAIL`
- `NEXT_PUBLIC_APP_URL` o `FLOWTASK_BASE_URL`

## Importante
Esta versión no promete validación mágica de correo sin proveedor real.
Queda preparada para validar entrega real una vez configurado Resend y el remitente.
