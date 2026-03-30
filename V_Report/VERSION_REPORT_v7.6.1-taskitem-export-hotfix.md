# v7.6.1 taskitem export hotfix

- Exported `TaskItem` from `src/components/tasks/task-kanban-board.tsx` so `task-workspace.tsx` can import the type during Next.js typecheck/build.
- No functional UI changes.
- Note: manifest 401 seen on Vercel preview is not caused by this type error; likely preview auth/caching/environment-related.
