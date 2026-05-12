# v58.22.1 — Full Semantic Migration + Motion Experience Layer

Base: v58.22.0 Semantic UI Classes + Density Contracts
Stage: production-candidate

## Summary

This release extends FlowTask's semantic design system with a motion and feedback experience layer. It introduces reusable UI primitives for animated tabs, reveal/expand motion, glass panels, feedback states and skeleton loading.

## Included

- New motion semantics in `globals.css`.
- New components: `AppMotion`, `AppSkeleton`, `AppFeedback`, `AppGlassPanel`, `AppAnimatedTabs`.
- `AppTabs` now uses the animated tab surface by default.
- Interactive `AppCard` now uses `ft-liquid-hover` instead of older hover lift language.
- Design tokens now export `motionExperienceLayer` and `semanticMigrationLayer`.
- No Supabase migration, RLS or data contract changes.

## Intent

The release gives the UI a 2026-style motion foundation without copying Apple, Magic UI or Notion. The goal is a FlowTask-owned style: subtle, productive, responsive and accessible.
