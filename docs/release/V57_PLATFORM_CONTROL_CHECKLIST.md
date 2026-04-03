# FlowTask — V57 Platform Control Checklist

## Objetivo
Cerrar la capa operativa del SaaS con una vista exclusiva para platform admins sin tocar el dashboard principal del usuario.

## Alcance incluido
- ruta consolidada `/app/platform`
- control de acceso real con `getAdminAccess()`
- métricas globales de organizaciones, usuarios, suscripciones, soporte, uso y errores críticos
- panel de observabilidad de errores recientes
- panel de uso con eventos dominantes y actividad reciente
- pulse card de readiness operativa
- acceso visible en navegación solo para platform admins

## Validaciones esperadas
- usuario no admin es redirigido a `/app/dashboard`
- usuario admin ve métricas, uso, errores, organizaciones, usuarios y soporte
- no se modifica el dashboard operativo del usuario normal
- no se agregan secretos ni artefactos locales al bundle
- `node scripts/verify-v57.mjs` responde OK

## Regla de continuidad
V57 se construye sobre V56 y deja lista la base para handoff profesional y QA final.
