# FlowTask — v54.3.2 Release Flow Consolidation

Base limpia para seguir trabajando 1:1 desde la **v54.3.1**, con enfoque en dejar el repo principal más claro para cierre de cliente.

## Objetivo de esta versión
- mantener una sola historia oficial de base de datos en `supabase/migrations/`
- conservar historial técnico y patches viejos solo como archivo interno
- reducir ruido en `scripts/`
- consolidar una ruta activa de verificación y release para seguir iterando sin romper el app

## Qué cambia en la v54.3.2
- se archivan scripts duplicados de TypeScript que ya no deben vivir en la raíz operativa:
  - `scripts/runtime-check.ts`
  - `scripts/release-check.ts`
- se archivan las verificaciones de versiones anteriores:
  - `scripts/verify-v54.3.mjs`
  - `scripts/verify-v54.3.1.mjs`
- se agrega una sola verificación activa en raíz:
  - `scripts/verify-v54.3.2.mjs`
- se consolidan scripts actuales de repo y release en `package.json`
- se actualiza la metadata de release a `54.3.2-release-flow-consolidation`

## Estructura canónica
### Runtime / app
- `src/`
- `public/`
- `scripts/` → solo ruta activa y checks operativos actuales
- `supabase/migrations/` → historia oficial de BD

### Archivo interno
- `archive/internal/legacy_release_history/RT_modulos/`
- `archive/internal/legacy_release_history/scripts/`

## Regla de trabajo desde esta base
Todo lo histórico, experimental o ya absorbido por la base canónica se mueve a `archive/internal/`.

El repo principal debe quedarse solo con:
- código de runtime
- migraciones canónicas
- scripts activos de validación/release
- documentación actual

## Flujo recomendado al reinstalar
```bash
npm install
cp .env.example .env.local
npm run validate:node
npm run validate:env
npm run runtime:check
npm run typecheck
npm run verify:v54.3.2
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
Usa esta **v54.3.2** como nueva base 1:1 para las siguientes versiones de cierre cliente.
