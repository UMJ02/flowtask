# FlowTask — v54.3.4 Client Release Docs & Handoff

Base actualizada sobre la **v54.3.3**, enfocada en dejar el repo principal más claro para cierre cliente, con documentación operativa visible y una ruta de entrega más limpia.

## Objetivo de esta versión
- mantener una sola historia oficial de base de datos en `supabase/migrations/`
- conservar el histórico técnico solo como archivo interno
- dejar un checklist claro de release cliente
- dejar documentación de handoff y operación en el repo

## Qué cambia en la v54.3.4
- se archiva la verificación anterior:
  - `scripts/verify-v54.3.3.mjs`
- se agrega la nueva verificación activa:
  - `scripts/verify-v54.3.4.mjs`
- se agrega documentación operativa visible:
  - `docs/release/CLIENT_RELEASE_CHECKLIST.md`
  - `docs/release/OPERATIONS_HANDOFF.md`
- se actualiza `package.json`:
  - se elimina `verify:v54.3.3`
  - se agrega `verify:v54.3.4`
  - `verify:current` ahora apunta a `v54.3.4`
  - se agrega `release:repo:v54.3.4`
  - `release:repo:current` ahora apunta a `v54.3.4`
- se actualiza la metadata de release a `54.3.4-client-release-docs`

## Estructura canónica
### Runtime / app
- `src/`
- `public/`
- `scripts/` → solo checks activos y operativos actuales
- `supabase/migrations/` → historia oficial de BD
- `docs/release/` → checklist y handoff visibles para cierre cliente

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

## Documentación nueva de cierre cliente
- `docs/release/CLIENT_RELEASE_CHECKLIST.md`
- `docs/release/OPERATIONS_HANDOFF.md`

## Notas de entrega
Este zip no incluye:
- `__MACOSX`
- `.DS_Store`
- `.next`
- `node_modules`
- `.git`
- `.env`
- `.env.local`

## Siguiente uso recomendado
Usa esta **v54.3.4** como nueva base 1:1 para seguir con la etapa de cierre cliente y QA final.
