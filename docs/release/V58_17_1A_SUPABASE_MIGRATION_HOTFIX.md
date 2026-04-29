# v58.17.1a — Supabase Migration Hotfix

## Motivo
La versión v58.17.1 introdujo una migración de contrato de cuenta (`0042`) que podía fallar en Supabase si la base ya tenía una estructura parcialmente aplicada o si el índice único de `organization_subscriptions.organization_id` no estaba disponible al momento de ejecutar `ON CONFLICT (organization_id)`.

## Qué corrige
- Agrega migración segura `0043_v58_17_1a_supabase_migration_hotfix.sql`.
- No borra datos de negocio.
- Elimina únicamente el constraint redundante `organization_members_role_allowed_v58171` si fue creado por `0042`.
- Asegura/crea el índice `organization_subscriptions_org_unique` solo si no hay duplicados por organización.
- Reemplaza `bootstrap_organization_workspace` con una versión defensiva que no depende de `ON CONFLICT (organization_id)`.
- Repara membresías faltantes para que el `owner_id` de una organización sea miembro `admin_global`.
- Mantiene el modelo: el usuario individual es la identidad principal y la organización es un workspace colaborativo.

## Qué hacer si ya corriste 0042
Ejecutar `0043_v58_17_1a_supabase_migration_hotfix.sql` en Supabase SQL Editor.

## Nota de planes
Esta hotfix vuelve el bootstrap al código interno existente `starter` / `Starter` para evitar introducir nombres comerciales nuevos antes de cerrar pricing.
