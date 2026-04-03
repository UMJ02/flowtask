# Internal archive

This folder stores historical release notes, legacy handoff material, and one-off SQL patch files that are **not** part of the canonical runtime history.

## Canonical database history
The official database migration source of truth is:

- `supabase/migrations/`

## Archived content
- `legacy_release_history/RT_modulos/` contains previous version reports, deploy notes, QA handoff docs, and historical patch SQL files kept only for internal traceability.
- `legacy_release_history/scripts/` contains old version-specific verification scripts and duplicate TypeScript script variants that were removed from the active root flow.

## Delivery rule
For client-ready bundles, keep runtime code and canonical migrations in the main repo, and keep historical release artifacts under this internal archive.

## v54.3.2 consolidation note
The active root verification path is now:

- `scripts/verify-v54.3.2.mjs`
- `npm run release:repo:current`
- `npm run qa:current`
- `npm run release:current`
