# v58.21.9 — Full Style Enforcement + Component Migration

Stage: production-candidate
Base: v58.21.8 Spacing Governance + Microinteraction Polish

## Goal

This release enforces the FlowTask visual system across secondary components that were still using bespoke Tailwind styles. It reduces style competition by migrating heavy manual shadows, oversized radii and loose spacing into named system surfaces.

## Included

- Runtime version updated to `58.21.9-full-style-enforcement-component-migration`.
- Strict verifier for legacy visual patterns across `src`.
- Heavy bespoke shadows replaced with tokenized named shadows.
- Oversized radii reduced to governed radii.
- Secondary modules moved closer to the compact card rhythm.
- Auth, settings, layout menus, drawers and secondary panels cleaned.
- No Supabase migrations, no RLS changes and no data payload changes.

## Visual rules enforced

- Normal surfaces use border + background, not decorative shadow.
- Floating UI uses `ft-floating-card` or the shared floating shadow token.
- Overlay UI uses `ft-overlay-card` or the shared overlay shadow token.
- Oversized radii are not allowed in app components.
- Large 8-step spacing is not allowed inside repeated app UI.
