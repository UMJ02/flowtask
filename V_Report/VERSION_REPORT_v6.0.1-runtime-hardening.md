# FlowTask v6.0.1-runtime-hardening

Base trabajada sobre `v6.0.0-product-polish`.

## Objetivo
Subir la confiabilidad real de runtime antes de seguir empujando features o más polish visual.

## Cambios aplicados
- se corrigieron errores reales de TypeScript en `Projects`, `Tasks` y `Clients`
- se completó el modelo de cliente con `overdueTasksCount` para evitar lecturas rotas en runtime
- se centralizó la lectura de variables críticas de entorno en `src/lib/runtime/env.ts`
- `src/lib/supabase/server.ts`, `client.ts` y `middleware.ts` ahora consumen ese helper en lugar de depender de non-null assertions
- se agregó `scripts/runtime-check.ts` para validar entorno público antes de release o despliegue
- se añadió `.env.example` como base operativa mínima

## Validación ejecutada
- `npm ci` ✅
- `npm run typecheck` ✅
- `npm run runtime:check` ✅ con variables de prueba
- `npm run build` ⚠️ no quedó certificado en este contenedor; la compilación no cerró y dejó `.next` parcial, así que no la marco como validación final

## Ruta siguiente sugerida
`v6.0.2-build-certification` para atacar build/release específicamente con foco en Next 15, caché y cierre real del pipeline.
