# Audit — v58.28.16.1 Task Data Sync CLI Hotfix

The CLI log for v58.28.16 failed at `tsc --noEmit` with four errors:

- Missing `TaskSummary` export from `@/types/task`.
- `WorkspaceTaskItem` uses `dueDate`, not `due_date`.

The hotfix restores the exported type and corrects the Workspace Pro date property without changing the data-sync architecture.
