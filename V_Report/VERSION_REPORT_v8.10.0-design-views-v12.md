# FlowTask v8.10.0-design-views-v12

## Base
- Construida sobre V11 completa.

## Cambios incluidos
- Nueva ruta `/app/pizarra` con la pizarra interactiva como vista dedicada.
- Sidebar actualizado para mostrar **Pizarra** en segunda posición del menú.
- Refactor de filtros de búsqueda a una sola barra principal con botón **Buscar** y botón **Expandir**.
- Aplicado en módulos de **Tareas** y **Proyectos**.
- Vista de **Tareas** simplificada: se elimina la sección de zona de trabajo / flujo y se reemplaza por una tarjeta vertical editable por columnas.
- Vista de **Proyectos** actualizada a tarjeta vertical editable por columnas.
- Edición inline en filas para nombre, cliente, estado, fecha, área y otros campos operativos.

## Archivos clave
- `src/app/(app)/app/pizarra/page.tsx`
- `src/components/layout/nav-links.ts`
- `src/components/filters/expandable-search-shell.tsx`
- `src/components/tasks/task-filters.tsx`
- `src/components/projects/project-filters.tsx`
- `src/components/tasks/task-editable-list.tsx`
- `src/components/projects/project-editable-list.tsx`
- `src/app/(app)/app/tasks/page.tsx`
- `src/app/(app)/app/projects/page.tsx`

## Nota
- Esta versión queda lista como nueva base completa para iteraciones visuales sobre vistas y experiencia de uso.
