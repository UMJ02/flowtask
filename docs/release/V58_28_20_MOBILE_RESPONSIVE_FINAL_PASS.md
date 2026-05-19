# v58.28.20 — Mobile / Responsive Final Pass

Base: v58.28.19 — UX Copy + Empty States Final.

This release focuses on final mobile and tablet behavior without touching Supabase, RLS, migrations, data sync, dependencies or Workspace Pro business logic.

## Scope

- Mobile bottom-sheet behavior for Workspace Pro sheets.
- Mobile bottom-sheet behavior for the right inspector.
- Touch-safe controls for tabs, buttons, table actions, inline task editing and board actions.
- Board horizontal mobile layout using controlled scroll columns.
- Dynamic viewport units for mobile browsers.
- Safe-area padding for iOS style devices.
- Reduced risk of overflow in Home, Board, Timeline, Table, Files and Reports.

## Validation

Run:

```bash
npm run verify:current
npm run workspace:mobile-responsive:ready
npm run build:preflight
npm run vercel:build
npm run dev
```
