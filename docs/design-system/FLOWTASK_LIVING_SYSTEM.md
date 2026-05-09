# FlowTask Living Design System

Version: v58.21.5 Modern Density + Motion System

## Intention
FlowTask uses a living design system: every screen should feel lighter, more compact, and easier to scan. The system is not a decorative layer; it governs density, hierarchy, motion, and when depth is allowed.

## Density rules
- Main screens use compact spacing: `space-y-5`, not large empty blocks by default.
- Regular cards use `p-4` or `p-5`; only hero/create screens may use larger spacing.
- Tables and lists should show more work per viewport without feeling crowded.
- Buttons should not visually compete with content unless they are the main action.

## Shadow rules
- Default cards do not use shadows.
- Use border + background for normal surfaces.
- Shadows are reserved for floating UI: modals, menus, drawers, toasts, and overlays.
- Hover should be subtle: a 1px lift or border change, not a large shadow.

## Motion rules
- Motion must help orientation, not decorate.
- Preferred timings: 150ms for controls, 180–200ms for reveals.
- Allowed patterns: subtle fade, 4–6px slide, press scale 0.98, hover lift 1px.
- Respect reduced motion.

## Button rules
- Primary: one main action per area.
- Secondary: safe alternative actions.
- Ghost: low emphasis navigation or secondary controls.
- Icon buttons: compact actions only when the icon is obvious.

## Card rules
- Use a card when content needs grouping or containment.
- Do not wrap every block in a card.
- Use `ft-muted-panel` for supportive or background information.

## Typography rules
- Page title: 26–30px.
- Section title: 18–20px.
- Card title: 15–16px.
- Body: 14px.
- Meta/labels: 11–12px.

## Migration rule
New app screens should start from AppPage, AppCard, AppToolbar, AppBadge, AppTabs and AppEmptyState. Avoid hardcoded shadows, oversized cards, and custom large controls unless there is a documented reason.
