# FlowTask — V58.10.5 Master Alignment Continuity Fix

Esta versión toma como base **V58.10.4** y prepara la continuidad oficial del proyecto para el depuramiento maestro, sin alterar la estructura funcional ni reabrir cambios innecesarios de UI/UX.

## Objetivo
- sanear la exportación del proyecto como base oficial de continuidad
- alinear metadata, scripts y documentación a `V58.10.5`
- declarar la cadena real de migraciones como fuente de verdad para base de datos
- conservar el master SQL histórico solo como referencia de arranque
- dejar una base limpia para seguir con depuración y siguientes versiones

## Qué cambia en la V58.10.5
- metadata y scripts alineados a `V58.10.5`
- nuevo `scripts/verify-v58.10.5.mjs`
- nuevo release doc `docs/release/V58_10_5_MASTER_ALIGNMENT_CONTINUITY_FIX.md`
- nuevo documento de continuidad BD `docs/release/DB_CONTINUITY_SOURCE_OF_TRUTH.md`
- copia de referencia del master SQL histórico en `supabase/master/flowtask_supabase_master_fixed.sql`
- `.gitignore` reforzado para exportaciones limpias de continuidad
- base de continuidad declarada: proyecto actual + migraciones `0001-0034`

## Scripts principales
- `npm run verify:v58.10.5`
- `npm run verify:current`
- `npm run release:repo:current`

## Base de continuidad
Usa esta **V58.10.5** como base oficial para el depuramiento maestro. La app debe continuar sobre el proyecto actual y la base de datos debe regirse por la cadena real de migraciones dentro de `supabase/migrations`.

## Continuidad técnica incorporada
- cambios de V58.10.4 preservados: pipeline de deploy, release exports y checks de continuidad
- V58.10.5 consolida la regla de trabajo para próximas versiones: ZIP limpio, estructura intacta y base SQL alineada a migraciones reales
