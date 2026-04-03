# V57.5 — Access Onboarding Modernization

## Objetivo
Modernizar el acceso inicial de FlowTask sin duplicar la lógica actual de organizaciones, miembros, roles ni suscripciones del workspace.

## Qué se integró
- onboarding modernizado para elegir entre uso individual y equipo / empresa
- base de datos mínima nueva:
  - `user_account_modes`
  - `activation_codes`
- activación self-serve de plan
- canje de código corporativo
- creación de organización conectada a `organizations`, `organization_members` y `organization_subscriptions`
- panel platform para generar códigos corporativos

## Regla de arquitectura
- `organization_subscriptions` sigue siendo la verdad del workspace
- no se crea una capa paralela de suscripción por cuenta
- el modo de cuenta solo define contexto de acceso y onboarding

## Validación esperada
```bash
node scripts/verify-v57.5.mjs
```
