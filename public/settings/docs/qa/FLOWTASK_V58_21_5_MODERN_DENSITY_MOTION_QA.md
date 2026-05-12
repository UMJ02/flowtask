# FlowTask QA — v58.21.5 Modern Density + Motion System

## CLI
Run:

```bash
npm run verify:v58.21.5
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```

## Visual QA
Review:

- /app/dashboard
- /app/tasks
- /app/tasks/new
- /app/tasks/[id]
- /app/projects
- /app/projects/new
- /app/projects/[id]
- /app/projects/[id]?mode=edit
- /app/clients
- /login
- /register

## Checklist visual
- Normal cards should not show decorative shadows.
- Floating UI such as dialogs and menus may still use shadow.
- Page titles should feel strong but not oversized.
- Buttons should be compact and consistent.
- Inputs should feel lighter and not dominate the form.
- Tables should be easier to scan with reduced vertical padding.
- Hover effects should be subtle.
- No business logic, Supabase or RLS behavior should change.
