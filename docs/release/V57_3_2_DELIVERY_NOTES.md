# FlowTask v57.3.2 — Settings Metrics UI Tuning

## Base
- Built on top of `v57.3.1-settings-cleanup`

## Included
- Reduced visual weight of the hero metrics in Settings.
- Metrics cards now use a tighter vertical layout and responsive value sizing.
- Grid now renders in 2 columns on mobile and 4 columns on large screens.
- Helper copy remains available on hover/title instead of occupying permanent card space.

## Files touched
- `src/components/settings/settings-account-overview.tsx`
- `src/lib/release/version.ts`
- `package.json`
- `scripts/verify-v57.3.2.mjs`

## Validation
- `node scripts/verify-v57.3.2.mjs`
