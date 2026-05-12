# FlowTask v58.21.9 QA — Style Enforcement + Component Migration

## CLI

```bash
npm run verify:v58.21.9
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```

## Visual QA

Review these routes:

- `/app/tasks`
- `/app/tasks/new`
- `/app/tasks/[id]`
- `/app/projects`
- `/app/projects/new`
- `/app/projects/[id]`
- `/app/clients`
- `/app/settings`
- `/app/profile`
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`

## Acceptance

- No heavy bespoke shadows in app surfaces.
- No oversized rounded cards competing with the system.
- Drawers, menus and floating elements use shared surface behavior.
- Tasks/projects remain functional.
- Supabase behavior remains unchanged.
