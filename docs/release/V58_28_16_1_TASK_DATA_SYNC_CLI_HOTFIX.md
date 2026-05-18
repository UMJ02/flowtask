# v58.28.16.1 — Task Data Sync CLI Hotfix

Hotfix over v58.28.16 focused on restoring TypeScript compatibility after the task status source-of-truth changes.

## Fixed
- Restored `TaskSummary` export in `src/types/task.ts` while keeping the expanded status union.
- Replaced `current?.due_date` with `current?.dueDate` for `WorkspaceTaskItem` in Workspace Pro.
- Added `verify:v58.28.16.1` and aligned readiness scripts to accept the hotfix version.

## Scope not changed
- No Supabase schema changes.
- No RLS changes.
- No UI redesign.
- No migration changes.
