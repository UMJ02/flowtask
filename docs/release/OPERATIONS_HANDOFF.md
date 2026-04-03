# FlowTask — Operations Handoff (v56)

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
- reportes de versiones cerradas
- artefactos de build

## Flujo recomendado
```bash
npm install
cp .env.example .env.local
npm run release:repo:current
npm run qa:current
npm run release:current
```

## Objetivo de esta base
Esta versión deja el repo en un estado más claro para cierre cliente:
- repo principal limpio
- histórico aislado
- documentación operativa visible
- una sola historia oficial de base de datos
