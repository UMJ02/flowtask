# FlowTask Design System — Spacing Governance + Microinteraction Polish

Version: v58.21.8
Base: v58.21.7

## Purpose

This layer makes FlowTask feel lighter and more current without changing product structure or business logic. The system follows a compact productivity rhythm: less empty air between cards, flatter surfaces by default, and motion only where it helps orientation.

## Spacing rule

FlowTask uses a limited spacing scale:

- 2px: hairline optical corrections
- 4px: icon/text micro gaps
- 8px: compact groups, button groups, small rows
- 12px: normal card internals and toolbar gaps
- 16px: page/card rhythm and larger groups
- 24px: page-level separation only

Avoid 32px+ inside repeated cards. Large spacing is reserved for outer page layout or one-off marketing/public sections.

## Surfaces

Default cards are flat:

- white background
- subtle border
- no decorative shadow

Use shadows only for named elevation variants:

- raised: one focal interactive surface
- floating: dropdowns, popovers, floating controls
- overlay: modals, drawers, menus over other content

## Microinteractions

Motion should be subtle and useful:

- reveal: new content enters with 4px vertical movement
- slide-fade: drawers, menus and filter panels
- expand: “Ver más”, collapsible sections and advanced filters
- pop: temporary feedback, status confirmations
- arrow action: arrows move 2px on hover

All motion respects `prefers-reduced-motion`.

## Density by zone

- Tasks/projects lists: compact
- Task/project detail: medium-compact
- Create forms: medium
- Auth/public screens: relaxed but not oversized
- Floating overlays: compact

## What not to use

Avoid in core app screens:

- `p-8`, `py-8`, `px-8`
- `gap-8`, `space-y-8`
- `text-[32px]`
- `sm:text-[32px]`
- `rounded-[28px]` or bigger for repeated app cards
- decorative shadow values like `shadow-[0_24px...]` on normal cards

