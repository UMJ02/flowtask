# FlowTask — V58.3 Release Hardening Base

Base actualizada sobre la **V58.2**, enfocada en dejar el repo y el bundle de entrega en un estado más seguro, coherente y listo para seguir iteraciones 1:1 sin contaminar la base.

## Objetivo de esta versión
- limpiar la base para entregas manuales
- normalizar el contrato de variables de entorno
- alinear scripts, versión activa y documentación de release
- mantener el proyecto listo para continuar sin romper lógica funcional

## Qué cambia en la V58.3
- se agrega `scripts/verify-v58.3.mjs`
- `verify:current` ahora apunta a `v58.3`
- `release:repo:current` ahora apunta a `v58.3`
- se agrega `.env.example` con el contrato actual de FlowTask
- `validate-env.mjs` ahora carga `.env.local` y `.env` igual que `runtime-check`
- se actualiza metadata de release a `58.3-release-hardening-base`
- se agrega documentación de entrega para `V58.3`

## Estructura canónica
### Runtime / app
- `src/`
- `public/`
- `scripts/` → checks activos y operativos actuales
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
- `docs/release/V58_3_DELIVERY_NOTES.md`

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
Usa esta **V58.3** como nueva base 1:1 para continuar cierre técnico, QA funcional y siguientes iteraciones de producto.
