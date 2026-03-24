# FlowTask v6.0.3-release-hardening

## Base
Derivada de la línea real del proyecto subida como `flowtask.zip`.

## Objetivo
Atacar cierre técnico real previo a release sin parchar módulos funcionales.

## Cambios aplicados
- corrección de tipado en `src/lib/queries/workspace-operating-system.ts`
- nuevo validador central de entorno en `src/lib/runtime/env.ts`
- endurecimiento de Supabase runtime en:
  - `src/lib/supabase/client.ts`
  - `src/lib/supabase/server.ts`
  - `src/lib/supabase/middleware.ts`
- nuevos scripts:
  - `scripts/runtime-check.ts`
  - `scripts/release-check.ts`
- nuevo `.env.example`
- actualización de versión y documentación

## Validación ejecutada
- `npm run typecheck` ✅
- `npm run runtime:check` ✅
- `npm run release:check` ✅
- `npm run build` ⚠️ bloqueado por ausencia de binario SWC compatible en este contenedor offline

## Nota de release
La base queda más lista para despliegue serio porque ya falla temprano cuando faltan variables críticas y porque el chequeo técnico previo a release queda documentado y ejecutable.
