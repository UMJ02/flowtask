# FlowTask v58.27.1 — Release Candidate Fixes Checklist

## Local

```bash
nvm use 20
npm install
npm run workspace:doctor
npm run workspace:production:ready
npm run workspace:real-env:ready
npm run workspace:performance:ready
npm run workspace:automation:ready
npm run workspace:collaboration:ready
npm run workspace:error-recovery:ready
npm run workspace:release-candidate:ready
npm run workspace:rc-fixes:ready
npm run verify:current
npm run typecheck
npm run build:preflight
npm run build
```

## Supabase

- `workspace_spaces` existe.
- `project_views` existe y acepta `home`.
- `workspace_space_projects` existe.
- RLS activo.
- Triggers `updated_at` activos.
- `safe_delete_visual_board` existe.

## Rutas clásicas vivas

- /app/workspace
- /app/tasks
- /app/projects
- /app/boards
- /app/reports
