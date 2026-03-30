# FlowTask v7.6.4 clean board fix

Base: zip entregado por el usuario.

Cambios aplicados:
- Eliminado uso de `useMemo` en los componentes clave del flujo de Pizarra para evitar el error runtime React #310.
- `src/components/dashboard/interactive-dashboard-board.tsx`
- `src/components/tasks/task-workspace.tsx`
- `src/components/tasks/task-kanban-board.tsx`

Objetivo:
- estabilizar la apertura de la vista `/app/dashboard?view=board`
- no tocar Supabase, Vercel ni schema
- mantener los cambios funcionales existentes
