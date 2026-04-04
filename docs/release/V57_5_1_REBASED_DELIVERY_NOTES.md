# V57.5.1 — Access Flow Rebased

Base: V57.5

## Ajustes aplicados
- endurecimiento del onboarding individual
- endurecimiento del onboarding team
- creación de organización con amarre de límites por plan
- asignación del admin inicial sin romper la estructura existente
- canje de códigos con salida consistente
- redirecciones limpias al cerrar cada paso

## Cambios clave
- `select-mode` ahora devuelve `redirectTo` y valida el plan de equipo
- `redeem-code` devuelve `redirectTo` y mantiene el flujo individual/team
- `create-workspace` respeta `organization_limit` y usa límites del código cuando existan
- `account-access` expone `redirectTarget`
- `onboarding` trata mejor los casos individual vs team

## Validación estructural
- `node scripts/verify-v57.5.1-rebased.mjs`
