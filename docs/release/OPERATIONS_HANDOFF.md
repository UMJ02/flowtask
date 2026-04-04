# FlowTask — Operations Handoff (V58.7)

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
- smoke postdeploy: `npm run postdeploy:smoke`

## Flujo recomendado
```bash
npm install
cp .env.example .env.local
npm run release:repo:current
npm run qa:current
npm run production:gate
npm run postdeploy:verify
```

## Objetivo de esta base
Esta versión deja el repo listo para deploy final y validación productiva:
- board y agenda diaria ya funcionales
- scripts de readiness de producción explícitos
- health/ready listos para smoke real
- workflow base para CI
- documentación operativa visible para release y rollback
