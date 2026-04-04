# V58.7 — Deploy + Producción Real

## Base
Se construye sobre `V58.6 Functional Closeout + Client Readiness`.

## Alcance
- cierre operativo para deploy reproducible
- validación explícita de readiness de producción
- smoke postdeploy contra endpoints reales
- documentación mínima para handoff técnico y rollback

## Cambios aplicados
- metadata y scripts alineados a `V58.7`
- nuevo `scripts/verify-v58.7.mjs`
- nuevo `scripts/deploy-production-readiness.mjs`
- nuevo `scripts/postdeploy-smoke.mjs`
- `smoke-health`, `deploy-summary` y `production-gate` corregidos a la línea viva `V58.x`
- `vercel.json` reforzado para deploy reproducible y headers de seguridad
- workflow base `.github/workflows/ci.yml` agregado
- checklist de cliente y handoff operativo actualizados a despliegue real

## Entrega
Esta versión deja el repo listo para conectar variables reales, desplegar en Vercel y correr smoke postdeploy sin reabrir la base funcional.
