# FlowTask — V58.10.5 Master Alignment Continuity Fix

Base aplicada sobre **V58.10.4** para iniciar el depuramiento maestro sin alterar la estructura funcional existente.

## Objetivo
- sanear la base oficial de continuidad
- alinear versión, scripts y documentación a `V58.10.5`
- declarar como fuente de verdad de BD la cadena real `supabase/migrations/0001-0034`
- conservar el master SQL histórico solo como referencia de arranque

## Alcance
- no se agregan features nuevas
- no se reorganiza la estructura del proyecto
- no se rehace la base de datos
- se prepara una base limpia para seguir con depuración, alineación y siguientes releases

## Cambios incluidos
- `package.json` y `package-lock.json` actualizados a `58.10.5-master-alignment-continuity-fix`
- `src/lib/release/version.ts` alineado a V58.10.5
- nuevo `scripts/verify-v58.10.5.mjs`
- checks de readiness alineados a V58.10.5
- `README.md` actualizado para continuidad
- nuevo documento `DB_CONTINUITY_SOURCE_OF_TRUTH.md`
- copia del master SQL histórico en `supabase/master/flowtask_supabase_master_fixed.sql`
- exportación limpia sin `.git`, `.next`, `node_modules`, `.vercel` ni `.env*`

## Regla de continuidad
La continuidad oficial de esta base queda definida como:
- proyecto actual del ZIP
- carpeta `supabase/migrations` completa
- migraciones reales `0001-0034`
- handoff técnico como referencia funcional del fix crítico de organizaciones

## Siguiente paso recomendado
Continuar el depuramiento sobre esta versión `V58.10.5` antes de introducir nuevas features o cambios amplios de UI/UX.
