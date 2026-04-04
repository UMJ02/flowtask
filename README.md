# FlowTask — V58.4 Build & Deploy Readiness

Base actualizada sobre la **V58.3**, enfocada en dejar el proyecto más listo para reinstalación, build reproducible y despliegue técnico sin contaminar la base funcional.

## Objetivo de esta versión
- consolidar la preparación técnica para build y deploy
- alinear la metadata de release con la nueva línea viva `V58.4`
- dejar verificación explícita para entorno, runtime y configuración de despliegue
- mantener la base segura para seguir iteraciones 1:1 sin romper lógica existente

## Qué cambia en la V58.4
- se agrega `scripts/verify-v58.4.mjs`
- se agrega `scripts/build-deploy-readiness.mjs`
- `verify:current` ahora apunta a `v58.4`
- `release:repo:current` ahora apunta a `v58.4`
- se agrega `.nvmrc` para fijar referencia de Node recomendada
- `vercel.json` usa `npm run vercel:build` como comando de build
- se actualiza metadata de release a `58.4-build-deploy-readiness`
- se agrega documentación de entrega para `V58.4`

## Estructura canónica
### Runtime / app
- `src/`
- `public/`
- `scripts/` → checks activos, QA y validaciones operativas
- `supabase/migrations/` → historia oficial de BD
- `docs/release/` → checklist, handoff y notas de entrega

### Archivo interno
- `archive/internal/legacy_release_history/RT_modulos/`
- `archive/internal/legacy_release_history/scripts/`
- `archive/internal/legacy_release_history/misc/`

## Flujo recomendado al reinstalar
```bash
npm install
cp .env.example .env.local
npm run validate:node
npm run validate:env
npm run verify:current
npm run runtime:check
npm run typecheck
npm run deploy:readiness
```

## Flujo recomendado antes de build local
```bash
npm run build:preflight
npm run build
```

## Flujo recomendado para Vercel / deploy técnico
```bash
npm run vercel:preflight
npm run vercel:deploy-check
```

## Flujo actual de repo limpio
```bash
npm run release:repo:current
```

## Flujo actual de QA consolidado
```bash
npm run qa:current
```

## Flujo actual de release consolidado
```bash
npm run release:current
```

## Documentación de cierre cliente
- `docs/release/CLIENT_RELEASE_CHECKLIST.md`
- `docs/release/OPERATIONS_HANDOFF.md`
- `docs/release/V58_4_BUILD_DEPLOY_READINESS.md`

## Notas de entrega
Este zip no incluye:
- `__MACOSX`
- `.DS_Store`
- `.next`
- `node_modules`
- `.git`
- `.env`
- `.env.local`
- `tsconfig.tsbuildinfo`

## Siguiente uso recomendado
Usa esta **V58.4** como nueva base 1:1 para continuar estabilización de deploy, QA funcional y siguientes iteraciones de producto orientadas a cliente final.
