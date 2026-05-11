# FlowTask Visual System — v58.24.9.9

## Direction

**FlowTask OS**: Apple-like productivity surfaces, Google Workspace clarity, monday-style operational dashboard, and Trello-style board readability.

## Principles

1. Content first: chrome must support the work, not compete with it.
2. Motion must explain state: loading, saving, moving, selected, success, error.
3. Consistency over decoration: cards, toolbars, chips, buttons and panels use shared classes.
4. Important does not move automatically: it highlights and filters.
5. Workspace separation stays clear: personal and organization contexts must never feel mixed.

## Core tokens

Defined in `src/app/globals.css`:

- `--ft-apple-bg`
- `--ft-apple-surface`
- `--ft-apple-border`
- `--ft-apple-text`
- `--ft-apple-muted`
- `--ft-apple-accent`
- `--ft-radius-*`
- `--ft-shadow-card`
- `--ft-shadow-float`

## Reusable classes

- `.ft-app-bg`
- `.ft-surface`
- `.ft-surface-flat`
- `.ft-apple-card`
- `.ft-apple-panel`
- `.ft-apple-toolbar`
- `.ft-apple-button`
- `.ft-apple-button-primary`
- `.ft-apple-button-secondary`
- `.ft-apple-chip`
- `.ft-state-chip-progress`
- `.ft-state-chip-production`
- `.ft-state-chip-waiting`
- `.ft-state-chip-done`
- `.ft-motion-functional`
- `.ft-hover-lift`
- `.ft-skeleton-line`

## Motion policy

Keep:
- skeleton loading
- small hover elevation
- modal fade/scale
- drag feedback
- important highlight

Remove/avoid:
- decorative loops
- row jumps on priority changes
- heavy public auth loaders
- repeated pulsing cards
- movement that hides what the user clicked

## Components touched

- Tasks overview
- Task action list
- Task Kanban
- Workspace home shell/cards
- Task detail shell/cards
- Task trash recovery
- Global CSS visual primitives
