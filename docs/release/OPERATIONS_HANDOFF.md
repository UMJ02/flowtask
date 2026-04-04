# FlowTask — Operations Handoff (V58.6)

## Fuente canónica actual
La historia oficial viva del esquema y evolución de base de datos está únicamente en:

- `supabase/migrations/`

## Archivo interno
Todo material histórico que no debe competir con la fuente oficial se conserva en:

- `archive/internal/legacy_release_history/RT_modulos/`
- `archive/internal/legacy_release_history/scripts/`
- `archive/internal/legacy_release_history/misc/`

## Regla operativa
No volver a introducir en la raíz del repo:
- `RT_modulos`
- patch SQL históricos sueltos
- artefactos de build
- secretos reales dentro del zip de entrega

## Referencia de entorno
- Node recomendado: ver `.nvmrc`
- build técnico Vercel: `npm run vercel:build`
- preflight de build local: `npm run build:preflight`

## Flujo recomendado
```bash
npm install
cp .env.example .env.local
npm run release:repo:current
npm run qa:current
npm run client:readiness:check
npm run release:current
```

## Objetivo de esta base
Esta versión deja el repo listo para avanzar a deploy final y bundle cliente:
- board con agenda diaria funcional
- cierre inline de tareas destacadas
- documentación operativa visible
- chequeos de readiness cliente explícitos
- base estable para QA final y entrega
