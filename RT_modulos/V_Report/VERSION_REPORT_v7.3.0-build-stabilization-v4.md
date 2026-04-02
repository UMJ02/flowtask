# FlowTask v7.3.0-build-stabilization-v4

## Objetivo
Base v4 para estabilización de build y hardening de deploy en Vercel sin tocar features funcionales.

## Cambios aplicados
- `package.json` actualizado a `7.3.0-build-stabilization-v4`.
- Nuevos scripts:
  - `build:strict`
  - `vercel:preflight`
  - `vercel:deploy-check`
- `runtime-check.mjs` endurecido:
  - carga `.env.local` y `.env`
  - valida formato de URL
  - avisa si la URL no parece Supabase
  - mantiene advertencia contra `service_role` expuesta como clave pública
  - tolera el formato nuevo de keys opacas de Supabase
- `release-check.mjs` simplificado para preflight realista antes de build.
- `vercel.json` agregado para dejar explícito `installCommand` y `buildCommand`.
- `.env.example` actualizado.

## Enfoque de esta versión
Esta v4 no agrega UI ni cambia lógica de negocio. Se concentra en preparar una base más segura para seguir con build/deploy y luego continuar con módulos sin romper producción.
