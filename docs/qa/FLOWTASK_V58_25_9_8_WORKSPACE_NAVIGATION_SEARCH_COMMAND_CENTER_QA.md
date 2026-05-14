# QA — FlowTask v58.25.9.8 Workspace Navigation + Search Command Center

## Checklist funcional

- Abrir `/app/workspace`.
- Click en “Buscar o ejecutar”.
- Confirmar que abre el command center.
- Confirmar que `⌘K` / `Ctrl+K` abre y cierra el command center.
- Buscar una tarea real y abrirla hacia Lista.
- Buscar un proyecto real y abrirlo en Home.
- Buscar un espacio real y abrirlo filtrado.
- Buscar una vista guardada y confirmar que aplica `savedViewId`.
- Buscar una pizarra y confirmar que abre `/app/boards/[boardId]`.
- Buscar un archivo con URL pública y confirmar que abre en pestaña nueva.
- Probar “Crear tarea rápida” con usuario con permiso.
- Probar “Crear tarea rápida” con usuario read-only: debe aparecer bloqueado.

## Checklist UX

- El modal no debe tapar de forma incómoda en mobile.
- `Esc` debe cerrar.
- Flechas arriba/abajo deben navegar resultados.
- `Enter` debe abrir el resultado activo.
- El estado vacío de búsqueda debe ser claro.
- La action bar no debe desbordarse en mobile.

## Checklist técnico

- No debe requerir migración nueva.
- No debe generar imports rotos.
- No debe afectar rutas clásicas.
- No debe romper `workspace:doctor`.
