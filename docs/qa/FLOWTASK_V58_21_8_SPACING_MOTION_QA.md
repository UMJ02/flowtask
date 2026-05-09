# FlowTask v58.21.8 QA — Spacing + Microinteractions

## CLI

Run:

```bash
npm run verify:v58.21.8
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```

## Visual QA

Check:

- /app/tasks
- /app/tasks/new
- /app/tasks/[id]
- /app/projects
- /app/projects/new
- /app/projects/[id]
- /login
- /register
- /forgot-password
- /reset-password

## Acceptance

- Cards feel closer but not cramped.
- No repeated large vertical gaps between cards.
- Normal cards are border-first, not shadow-first.
- Floating menus/drawers still have depth.
- Buttons feel compact and consistent.
- Arrow/inline actions have subtle motion.
- “Ver más” or expandable areas animate without feeling playful.
- Public auth screens no longer feel like a separate oversized system.

