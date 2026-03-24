# FlowTask v6.0.3 — Release Hardening

Base real endurecida para cierre técnico previo a despliegue.

## Objetivo de esta versión
- cerrar errores reales de TypeScript
- validar runtime mínimo obligatorio
- endurecer acceso a variables críticas de entorno
- dejar una ruta clara para certificación de build en entorno local o CI

## Scripts clave
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run typecheck`
- `npm run runtime:check`
- `npm run release:check`

## Qué se endureció
- tipado corregido en `workspace-operating-system`
- validación central de entorno en `src/lib/runtime/env.ts`
- clientes Supabase conectados a runtime validado
- middleware con redirección más segura y preservación de querystring
- `.env.example` agregado para despliegue y onboarding técnico

## Estado honesto
- `npm run typecheck` pasa en esta base
- `npm run runtime:check` pasa con variables presentes
- `next build` todavía depende de un binario SWC compatible en el entorno de ejecución
