# VERSION REPORT v8.10.0 — design-views-v12

## Cambios incluidos
- nueva página `/app/pizarra` con la pizarra interactiva en vista dedicada
- `Pizarra` agregada al sidebar en segunda posición
- búsqueda unificada con barra principal, botón `Buscar`, botón `Expandir` y filtros avanzados desplegables
- búsqueda unificada aplicada en `Tareas` y `Proyectos`
- en `Tareas` se eliminó la zona de trabajo / flujo y se reemplazó por una vista editable por columnas
- en `Tareas` y `Proyectos` ahora existe una card vertical editable por columnas con guardado por fila

## Archivos principales
- `src/app/(app)/app/pizarra/page.tsx`
- `src/components/ui/search-unified.tsx`
- `src/components/tasks/task-editable-list.tsx`
- `src/components/projects/project-editable-list.tsx`
- `src/app/(app)/app/tasks/page.tsx`
- `src/app/(app)/app/projects/page.tsx`
- `src/components/layout/nav-links.ts`
- `src/lib/queries/catalog.ts`
