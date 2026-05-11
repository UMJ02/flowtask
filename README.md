# FlowTask — v58.24.9.9.1 Visual Style Deduplication + Motion Cleanup Pass

Base: **v58.24.9.9 — Visual System Cleanup + Apple Workspace UI Polish**

## Objetivo

Hacer que el sistema visual nuevo realmente gobierne más la app, reduciendo estilos viejos repetidos que estaban empujando sobre la dirección Apple Workspace.

## Cambios principales

### Deduplicación visual

Se reducen estilos directos repetidos en `src/**/*.tsx`:

```txt
border-[#E5EAF1] → 0 usos
text-[#0F172A] → 0 usos
text-[#64748B] → 0 usos
hover:-translate → 0 usos
```

Se agregan aliases globales:

```txt
ft-border
ft-border-strong
ft-text-main
ft-text-muted
ft-text-faint
ft-bg-surface
ft-bg-muted
ft-control
ft-control-muted
```

### Cleanup de motion

- Se elimina `hover:-translate` en componentes de app.
- En pantallas principales se remueve `animate-pulse` directo y se usa `ft-skeleton-line`.
- Se mantiene motion funcional: skeleton, feedback de importante, drag feedback y estados de acción.

### Pantallas priorizadas

Se depuró con más fuerza:

```txt
/app/tasks
/app/tasks/trash
TaskActionList
TaskKanbanBoard
WorkspaceHome
TaskWorkspaceInline
```

## Validación recomendada

```bash
npm install
npm run verify:v58.24.9.9.1
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
