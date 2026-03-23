# VERSION REPORT — v1.4.0-productivity

## Objetivo
Aumentar velocidad real de uso sobre la base ya estabilizada, sin abrir deuda nueva.

## Cambios principales

### 1) Task kanban mejorado
- actualización optimista al mover tareas
- rollback en caso de error
- dropzones con feedback visual
- resumen de conteos por columna
- orden más útil por fecha

### 2) Vistas guardadas
Se agregó `FilterPresets` para tareas, proyectos y clientes.

Capacidades:
- guardar la vista actual con nombre corto
- reabrir filtros frecuentes sin reconstruir querystrings
- limpiar vista al estado base
- eliminar vistas guardadas

Persistencia:
- localStorage del navegador
- hasta 6 vistas por módulo

### 3) Command palette más útil
- resultados de vistas guardadas
- acciones rápidas de búsqueda libre para tareas, proyectos y clientes
- mensaje de uso más claro

## Archivos nuevos
- `src/components/ui/filter-presets.tsx`

## Archivos modificados
- `src/app/(app)/app/tasks/page.tsx`
- `src/app/(app)/app/projects/page.tsx`
- `src/app/(app)/app/clients/page.tsx`
- `src/components/layout/command-palette.tsx`
- `src/components/tasks/task-kanban-board.tsx`
- `README.md`
- `package.json`

## Validación
- `npm run typecheck` en cero

## Nota
No se tocó el modelo multi-tenant ni se alteraron permisos/RLS en esta versión. El foco fue productividad de uso y recuperación rápida de contexto.
