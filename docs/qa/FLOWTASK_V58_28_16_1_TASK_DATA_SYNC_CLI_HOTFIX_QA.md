# QA — v58.28.16.1 Task Data Sync CLI Hotfix

Run:

```bash
npm install
npm run verify:current
npm run workspace:task-sync:ready
npm run build:preflight
npm run vercel:build
npm run dev
```

Expected:
- `TaskSummary` imports resolve.
- Workspace Pro uses `dueDate` for local task items.
- Readiness scripts accept `58.28.16.1-task-data-sync-cli-hotfix`.
- Classic and Pro task status sync changes from v58.28.16 remain in place.
