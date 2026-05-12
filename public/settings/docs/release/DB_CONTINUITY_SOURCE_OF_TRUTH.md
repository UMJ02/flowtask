# FlowTask — DB Continuity Source of Truth

## Regla oficial
La base de datos oficial para continuidad de FlowTask se rige por la carpeta:

- `supabase/migrations`

con la cadena real de migraciones:

- `0001-0034`

## Estado del master SQL
El archivo `supabase/master/flowtask_supabase_master_fixed.sql` se conserva como **referencia histórica de arranque** y snapshot consolidado temprano. No debe tratarse como fotografía final única del sistema.

## Implicación práctica
Para nuevas versiones:
- no rehacer la BD
- no sobrescribir migraciones anteriores
- agregar migraciones nuevas cuando corresponda
- validar cualquier cambio sensible del bloque de organizaciones sobre el flujo real de migraciones

## Bloque sensible
Antes de tocar lógica de organizaciones, validar siempre:
- `bootstrap_organization_workspace`
- `accept_organization_invite`
- founder bootstrap
- `organization_members`
- cualquier trigger o función ligada a `organization_subscriptions`
