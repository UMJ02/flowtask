# FlowTask Style Enforcement

Version: v58.21.9

The design system is now enforced beyond the core task/project screens. Secondary components must not introduce bespoke radii, shadows or spacing that competes with the governed UI.

## Surface policy

- `ft-section-card`: standard app card.
- `ft-main-card`: primary content card.
- `ft-mini-card`: compact supporting content.
- `ft-floating-card`: menus, popovers, floating panels.
- `ft-overlay-card`: drawers and modal surfaces.

## Disallowed in app components

- Heavy handcrafted shadows.
- Oversized radii.
- Loose 8-step spacing inside repeated UI.
- Large app text sizes outside page titles and public landing exceptions.

## Motion policy

Use motion for orientation and feedback only: reveal, slide/fade, expand, arrow movement and pressed states.
