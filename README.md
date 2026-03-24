# FlowTask v6.0.1-runtime-hardening

Base validada sobre `v6.0.0-product-polish`.

## Objetivo
Endurecer la base real de runtime antes de seguir con más polish o expansión funcional.

## Enfoque
- cerrar errores reales de TypeScript que ya afectaban la capa core
- centralizar variables críticas de entorno para evitar fallos silenciosos
- dejar una verificación mínima reproducible para despliegue y validación local

## Scripts
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run typecheck`
- `npm run runtime:check`

## Cambios clave
- se corrigen errores reales en `Projects`, `Tasks` y `Clients`
- se agrega `src/lib/runtime/env.ts` para lectura segura de variables de entorno
- los clientes de Supabase quedan conectados a un helper único de entorno
- se suma `scripts/runtime-check.ts` y `.env.example` como base de operación
- se actualiza documentación y versionado a `v6.0.1-runtime-hardening`
