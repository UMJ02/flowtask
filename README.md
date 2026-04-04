# FlowTask — V58.8 Performance + Hardening Final

Esta versión toma como base **V58.7** y cierra la capa final de performance/hardening para cliente sin reabrir la arquitectura ni mezclar líneas paralelas.

## Objetivo
- endurecer el repo final antes de release cliente
- bajar riesgo operativo en scripts de entorno sin depender de paquetes extra
- reforzar configuración base de Next/Vercel para producción
- dejar una base limpia para cierre final o handoff técnico

## Qué cambia en la V58.8
- metadata y scripts alineados a `V58.8`
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
