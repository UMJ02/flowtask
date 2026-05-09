# FlowTask v58.22.1 QA — Full Semantic Migration + Motion Experience Layer

## CLI

Run:

```bash
npm run verify:v58.22.1
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

## Interaction checks

- Tabs should feel smoother and use the animated tab style.
- Interactive cards should move subtly, not jump.
- Feedback states should be visible for saving/success/error where used.
- Glass surfaces should appear only in floating UI, not normal cards.
- Skeletons should use `ft-skeleton` where loading placeholders are needed.
- Reduced motion mode should reduce animations.

## Regression checks

- No Supabase migrations were added.
- Auth still works.
- Project inline edit still works.
- Task detail feed still works.
- Attachments still show previews.
