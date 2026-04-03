# FlowTask — v54.3.3 Package & Release Streamline

Base actualizada sobre la **v54.3.2**, enfocada en dejar el repo principal todavía más limpio para seguir iterando 1:1 sin arrastrar ruido histórico en el flujo activo.

## Objetivo de esta versión
- mantener una sola historia oficial de base de datos en `supabase/migrations/`
- conservar el histórico técnico solo como archivo interno
- simplificar el flujo activo de verificación y release
- dejar `package.json` más claro para cierre cliente

## Qué cambia en la v54.3.3
- se archiva la verificación anterior:
  - `scripts/verify-v54.3.2.mjs`
- se agrega la nueva verificación activa:
  - `scripts/verify-v54.3.3.mjs`
- se simplifica `package.json`:
  - se elimina `verify:v54.3.2`
  - se elimina `release:repo:v54.3.2`
  - se agrega `verify:current`
  - se agrega `release:repo:v54.3.3`
  - `release:repo:current` ahora apunta a `v54.3.3`
  - `qa:current` ahora incluye la verificación actual
  - `release:current` consolida repo + QA + validación preproducción + gate final
- se mueve `testfile` al archivo interno para dejar la raíz más limpia
- se actualiza la metadata de release a `54.3.3-release-package-streamline`

## Estructura canónica
### Runtime / app
- `src/`
- `public/`
- `scripts/` → solo checks activos y operativos actuales
- `supabase/migrations/` → historia oficial de BD

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
Usa esta **v54.3.3** como nueva base 1:1 para las siguientes versiones de cierre cliente.
