# FlowTask — v57 Platform Control Base

Base actualizada sobre la **v54.3.4**, enfocada en dejar el repo principal listo para cierre técnico, higiene de seguridad y entrega limpia a cliente sin tocar el core funcional del producto.

## Objetivo de esta versión
- endurecer la base del repo para release cliente
- formalizar el contrato de variables de entorno
- evitar que secretos y artefactos locales vuelvan al bundle de entrega
- dejar verificación explícita para repo limpio + hardening
- mantener intacta la arquitectura y el comportamiento estable del app

## Qué cambia en la v55
- se elimina del bundle de entrega todo artefacto local no deployable:
  - `.env`
  - `.env.local`
  - `.next`
  - `node_modules`
  - `.git`
  - `__MACOSX`
  - `.DS_Store`
  - `tsconfig.tsbuildinfo`
- se fortalece `.gitignore` para evitar reincidencias de archivos locales
- se agrega `.env.example` completo con contrato público + server + opcionales
- se reemplaza la verificación anterior activa por:
  - `scripts/verify-v55.mjs`
- se endurecen checks operativos:
  - `scripts/security-check.mjs`
  - `scripts/release-check.mjs`
- se agrega documentación visible de hardening:
  - `docs/release/V55_HARDENING_CHECKLIST.md`
  - `docs/release/V55_DELIVERY_NOTES.md`
- se actualiza metadata de release a `55.0.0-production-hardening`

## Estructura canónica
### Runtime / app
- `src/`
- `public/`
- `scripts/` → checks activos y operativos actuales
- `supabase/migrations/` → historia oficial de BD
- `docs/release/` → checklist, handoff y guía de cierre técnico

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
npm run security:check
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

## Regla principal de esta base
Esta **v55** debe usarse como base oficial para seguir cerrando el producto sin rehacer ni refactorizar el núcleo. El enfoque es:
- hardening
- limpieza de repo
- cierre técnico
- cero secretos en bundles
- continuidad 1:1 sobre el código estable


## Release actual

- versión: `57.0.0-platform-control`
- foco: platform control + observabilidad SaaS
- continuidad sugerida: handoff final + QA de entrega


## Qué agrega V57
- centro de control SaaS exclusivo para platform admins
- métricas globales de plataforma
- observabilidad visible de errores recientes
- visibilidad de uso real mediante usage events
- acceso condicional al módulo platform desde la navegación de admins


## V57.5 — Access onboarding modernization

FlowTask ahora incluye una base moderna para acceso individual, equipo / empresa y códigos corporativos sin duplicar la suscripción organizacional existente.
