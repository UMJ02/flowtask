# FlowTask Design System — Full Semantic Migration + Motion Experience Layer

Version: v58.22.1

This document defines the next layer of the FlowTask product UI system. The goal is not decorative animation. The goal is a living, semantic interface where motion, surfaces and feedback explain state changes and reduce friction.

## Principles

- Semantic classes first: components should use named roles like `ft-title-card`, `ft-surface-card`, `ft-btn-primary`, `ft-input`, `ft-density-detail` and motion roles instead of bespoke values.
- Motion with purpose: reveal, expand, feedback, tabs, drawers and row actions can move. Static content should not animate for decoration.
- Glass only for floating UI: use glass surfaces for popovers, drawers, toolbars, command surfaces and overlays. Do not use glass on every card.
- Feedback is visible: saving, success, error and selected states must have consistent visual language.
- Reduced motion is respected through the global `prefers-reduced-motion` policy.

## New semantic motion classes

- `ft-motion-tab`: tabs and segmented controls.
- `ft-motion-list-item`: interactive rows and cards.
- `ft-motion-expandable`: expand/collapse areas such as filters and “Ver más”.
- `ft-motion-feedback`: save/sync/error state changes.
- `ft-liquid-hover`: subtle Apple/Magic UI-inspired hover used only on interactive cards.

## Glass and soft surfaces

- `ft-glass-panel`: subtle translucent panel.
- `ft-glass-toolbar`: floating toolbar or filters strip.
- `ft-popover-surface`: menus and contextual popovers.
- `ft-drawer-surface`: drawers and sheets.
- `ft-command-surface`: command or quick action overlays.

## Feedback states

- `ft-feedback-saving`
- `ft-feedback-success`
- `ft-feedback-error`
- `ft-feedback-neutral`
- `ft-state-selected`
- `ft-state-saving`
- `ft-state-success`
- `ft-state-error`

## Skeletons

Use `AppSkeleton` or `AppSkeletonStack` instead of hand-built gray blocks.

## Components added

- `AppMotion`
- `AppSkeleton`
- `AppFeedback`
- `AppGlassPanel`
- `AppAnimatedTabs`

## Do not

- Do not put glass on every task or project card.
- Do not add large decorative animations to productivity flows.
- Do not add new Supabase columns for UI polish.
- Do not bypass feedback states with one-off colors.
