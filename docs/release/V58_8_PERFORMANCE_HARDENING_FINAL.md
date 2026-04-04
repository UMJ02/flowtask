# V58.8 — Performance + Hardening Final

## Base usada
- `flowtask_v58_7_deploy_produccion_real_full.zip`

## Enfoque
Esta versión no reabre módulos ni mete features nuevas. Cierra la capa final de endurecimiento técnico antes de un bundle cliente final.

## Cambios aplicados
- metadata de release actualizada a `V58.8`
- nuevo `scripts/load-env.mjs` para cargar `.env.local` y `.env` sin depender de `dotenv`
- `runtime-check`, `validate-env`, `smoke-health` y `postdeploy-smoke` migrados al nuevo loader
- nuevo `scripts/hardening-final-check.mjs`
- nuevo `scripts/verify-v58.8.mjs`
- `next.config.ts` endurecido con:
  - `reactStrictMode: true`
  - `poweredByHeader: false`
  - `compress: true`
  - `optimizePackageImports` para `lucide-react`
- `vercel.json` reforzado con:
  - `Permissions-Policy`
  - cache específico para `manifest.webmanifest`
  - `no-store` para `sw.js`
- `public/sw.js` actualizado a cache `flowtask-v58-8`

## Resultado esperado
- checks de entorno más robustos en bundles limpios
- menos dependencia de instalación local solo para validar release
- configuración base más firme para producción final
- continuidad limpia para cierre cliente
