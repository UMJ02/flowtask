# FlowTask — V58.11.2 Final Ops Email Purge QA

Base completa y actualizada para continuidad sobre **V58.11.1**, enfocada en cierre operativo real: purga automática de organizaciones vencidas, diagnóstico de correo e indicadores para QA final.

## Qué cambia en la V58.11.2
- versión y metadata alineadas a `V58.11.2`
- nuevo `scripts/verify-v58.11.2.mjs`
- nuevo release doc `docs/release/V58_11_2_FINAL_OPS_EMAIL_PURGE_QA.md`
- purga automática diaria para organizaciones con eliminación programada
- endpoint cron protegido para ejecutar la purga real
- script manual de purga para operaciones y soporte
- helper de correo con diagnóstico más claro de configuración
- checklist de QA final para correo, cron y servicio admin

## Validación sugerida
- `npm run verify:v58.11.2`
- `npm run typecheck`
- `npm run deploy:readiness`
- `npm run build:preflight`

## Continuidad
Usa esta **V58.11.2** como base oficial para seguir puliendo la experiencia de organización. La app continúa sobre el proyecto actual y la base de datos sigue regida por la cadena real de migraciones dentro de `supabase/migrations`.
