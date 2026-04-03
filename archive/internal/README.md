# Internal archive

This folder stores historical release notes, legacy handoff material, and one-off SQL patch files that are **not** part of the canonical runtime history.

## Canonical database history
The official database migration source of truth is:

- `supabase/migrations/`

## Archived content
- `legacy_release_history/RT_modulos/` contains previous version reports, deploy notes, QA handoff docs, and historical patch SQL files kept only for internal traceability.

## Delivery rule
For client-ready bundles, keep runtime code and canonical migrations in the main repo, and keep historical release artifacts under this internal archive.

## v54.3.1 cleanup note
Legacy version-specific verification scripts and one-off signoff scripts were moved to:

- `archive/internal/legacy_release_history/scripts/`

The active repo keeps only the current verification path for the cleaned canonical base.
