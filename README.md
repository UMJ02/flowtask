# FlowTask — V58.8.1 Deploy Fix

Esta versión toma como base **V58.8** y corrige el pipeline de deploy real para dejar FlowTask listo para Vercel sin romper la base funcional.

## Objetivo
- corregir el pipeline real de deploy en Vercel
- alinear Node, scripts de verificación y metadata viva
- eliminar falsos negativos en readiness checks
- mantener intacta la base funcional y de hardening de V58.8

## Qué cambia en la V58.8.1
- metadata y scripts alineados a `V58.8.1`
- nuevo loader local `scripts/load-env.mjs` para que checks de entorno funcionen incluso sin dependencias instaladas
- nueva verificación `scripts/verify-v58.8.mjs`
- nuevo chequeo `scripts/hardening-final-check.mjs`
- `next.config.ts` endurecido con `reactStrictMode`, `poweredByHeader: false`, `compress` y `optimizePackageImports`
- `vercel.json` reforzado con `Permissions-Policy` y reglas de cache para `sw.js` y `manifest.webmanifest`
- `public/sw.js` actualizado a cache `flowtask-v58-8`
- documentación de release actualizada a `V58.8`

## Scripts principales
- `npm run verify:v58.8`
- `npm run hardening:final:check`
- `npm run verify:current`
- `npm run release:repo:current`

## Base de continuidad
Usa esta **V58.8** como base 1:1 para release final, performance review, cierre cliente o una V58.9 si quieres un polishing final visual sin tocar arquitectura.


## Ajustes de deploy fix
- `engines.node` fijado a `20.x`
- `.nvmrc` normalizado a `20`
- nuevo `scripts/verify-v58.8.1.mjs`
- `verify:current` y `release:repo:current` apuntan a `V58.8.1`
- `build-deploy-readiness.mjs` ya valida `V58.8.1` y acepta `npm ci` en `vercel.json`
- `deploy-production-readiness.mjs` mantiene chequeos reales de archivos y headers

## Base de continuidad
Usa esta **V58.8.1** como base 1:1 para deploy en Vercel o continuidad hacia una siguiente versión funcional.
