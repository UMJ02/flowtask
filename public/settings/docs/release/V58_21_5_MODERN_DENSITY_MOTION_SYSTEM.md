# v58.21.5 — Modern Density + Motion System

Base: v58.21.4 Design System Governance + Core Screen Migration
Stage: production-candidate

## Summary
This release reduces visual weight across FlowTask and introduces a living density/motion system. The goal is to make the app feel more modern, compact, and product-ready without changing Supabase, RLS, auth, or business logic.

## Included
- Compact design tokens for page titles, cards, buttons, inputs and data tables.
- Border-led card system with shadows removed from normal app surfaces.
- Floating shadow reserved for overlays, dialogs, dropdowns and drawers.
- Motion utilities for subtle reveal and slide/fade transitions.
- Smaller buttons, chips, tables and standard controls.
- Updated UI components: Button, Input, Select, Textarea, AppCard, AppToolbar, AppTabs, AppEmptyState.
- Living design system documentation.

## Not included
- No Supabase migrations.
- No RLS changes.
- No changes to task/project payloads.
- No new product features.

## UX direction
The app should feel closer to a modern productivity tool: content-first, compact, calm, light, with depth only where it improves orientation.
