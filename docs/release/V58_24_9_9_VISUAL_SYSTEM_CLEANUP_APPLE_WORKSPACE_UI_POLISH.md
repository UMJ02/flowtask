# v58.24.9.9 — Visual System Cleanup + Apple Workspace UI Polish

**Base:** v58.24.9.8 — Client Final Readiness + Global Modal System + Trash Recovery

## Enfoque

Esta versión no cambia la lógica principal. Su objetivo es unificar el sistema visual para que FlowTask se sienta más consistente y listo para cliente final.

## Dirección

```txt
70% Apple Workspace Clean
20% monday Soft Dashboard
10% Trello Board Focus
```

## Qué se agregó

- Tokens visuales Apple-like.
- Superficies reutilizables.
- Botones primarios/secundarios reutilizables.
- Chips semánticos.
- Skeleton reutilizable.
- Motion policy con `prefers-reduced-motion`.
- Guía visual en docs.

## Archivos principales

- `src/app/globals.css`
- `docs/design/FLOWTASK_VISUAL_SYSTEM_V58_24_9_9.md`
- `src/app/(app)/app/tasks/page.tsx`
- `src/components/tasks/task-action-list.tsx`
- `src/components/tasks/task-kanban-board.tsx`
- `src/components/workspace/workspace-home.tsx`
- `src/components/tasks/task-workspace-inline.tsx`
- `src/components/tasks/task-trash-recovery.tsx`
