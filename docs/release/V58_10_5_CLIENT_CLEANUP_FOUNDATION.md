# FlowTask v58.10.5 — Client Cleanup Foundation

## Objetivo
Preparar la base de continuidad para entregas cliente con estructura limpia, empaquetado consistente y validaciones alineadas a Vercel + Supabase.

## Cambios principales
- Limpieza del root del proyecto para la entrega.
- Eliminación del bundle de archivos locales no requeridos para runtime o deploy.
- Reubicación de artefactos locales sueltos hacia `archive/internal/local_artifacts/`.
- Alineación de metadata de release a `v58.10.5`.
- Nuevo verificador `scripts/verify-v58.10.5.mjs`.
- Corrección de `scripts/ops-check.mjs` para dejar de depender del token legacy `verify:v54.1`.

## Paths removidos del root de entrega
- `.env`
- `.env.local`
- `.next`
- `node_modules`
- `.git`
- `.vercel`
- `flowtask@58.10.1-deploy-pipeline-fix`

## Paths reubicados
- `next` -> `archive/internal/local_artifacts/next`
- `To` -> `archive/internal/local_artifacts/To`
- `testfile` -> `archive/internal/local_artifacts/testfile`
- `redeploy.txt` -> `archive/internal/local_artifacts/redeploy.txt`
- `npm-ci.log` -> `archive/internal/local_artifacts/npm-ci.log`
- `tsconfig.tsbuildinfo` -> `archive/internal/local_artifacts/tsconfig.tsbuildinfo`

## Resultado
Base lista para continuar con:
1. Board final alignment (v58.10.6)
2. Hardening técnico (v58.10.7)
3. Estabilidad productiva Vercel/Supabase (v58.10.8)
4. Release candidate cliente (v58.10.9)
