# V57.7 — Billing Commercial Closure

## Alcance
- estado del plan actual
- fecha de vigencia
- renovación anual
- upgrade / downgrade
- bloqueo suave si vence
- relación entre código corporativo y suscripción
- migraciones consolidadas de V57.6 + V57.7

## Archivos clave
- supabase/migrations/0029_v57_6_subscription_capacity_controls.sql
- supabase/migrations/0030_v57_7_billing_commercial_lifecycle.sql
- src/app/api/organization/billing/manage/route.ts
- src/components/organization/organization-subscription-lifecycle-panel.tsx
- src/lib/queries/billing.ts
- src/components/organization/billing-command-center.tsx
- src/components/organization/organization-billing-summary.tsx

## Nota
Esta versión toma como base la V57.6 y agrega el cierre comercial sin introducir una lógica paralela de suscripciones.
