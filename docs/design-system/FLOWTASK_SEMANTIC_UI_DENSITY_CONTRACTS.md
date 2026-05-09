# v58.22.0 Semantic UI Classes + Density Contracts

This document defines the semantic UI layer for FlowTask. It converts the visual system from raw Tailwind values into named roles that can be used consistently across screens.

## Semantic text roles

- `ft-title-page` for page titles.
- `ft-title-section` for section headers.
- `ft-title-card` for card titles.
- `ft-text-body` for primary body copy.
- `ft-text-muted` for secondary copy.
- `ft-text-meta` for dates, helper text and compact metadata.
- `ft-text-label` for small uppercase labels.

## Density contracts

- `ft-density-list`: tables, filters, list rows and compact repeated content.
- `ft-density-detail`: task/project detail workspaces.
- `ft-density-create`: guided create flows.
- `ft-density-auth`: public/auth screens that need more breathing room.
- `ft-density-dashboard`: dashboard cards and mixed analytics panels.

## Surface roles

- `ft-surface-card` / `ft-main-card` for normal cards.
- `ft-surface-muted` / `ft-mini-card` for low emphasis blocks.
- `ft-surface-floating` for menus and dropdowns.
- `ft-surface-overlay` for drawers and modals.

## Rule

New UI should prefer semantic roles and density contracts over raw spacing, typography, radius and shadow values.
