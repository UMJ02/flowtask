# v58.28.18 — Dependency Security Audit + Safe Next Patch

## Objetivo
Cerrar vulnerabilidades reportadas por `npm audit` sin usar `--force` y sin tocar UI, Supabase, RLS, rutas clásicas ni lógica de datos.

## Cambios principales
- Next.js actualizado de `15.3.8` a `15.5.18`.
- `npm audit --audit-level=moderate` queda en 0 vulnerabilidades.
- Se agregan overrides seguros para subdependencias vulnerables:
  - `next@15.5.18 > postcss` a `8.5.14`.
  - `brace-expansion` a `5.0.6`.
  - `picomatch` a `4.0.4`.
  - `ws` a `8.20.1`.
- Nuevo check: `workspace:dependency-security:ready`.
- `build:preflight` ahora valida seguridad de dependencias antes de `typecheck`.

## No se tocó
- Supabase schema.
- RLS.
- Migraciones.
- Workspace Pro UI.
- Clásico/Pro data sync.
- Rutas clásicas.
- Dependencias mayores con `--force`.

## Validación esperada
```bash
npm install
npm audit --audit-level=moderate
npm run verify:current
npm run workspace:dependency-security:ready
npm run build:preflight
npm run vercel:build
npm run dev
```
