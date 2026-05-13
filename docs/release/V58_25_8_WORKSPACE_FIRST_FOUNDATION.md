# FlowTask v58.25.8 — Workspace-First Foundation

## Objetivo

Implementar una nueva capa de experiencia Workspace-First inspirada en ClickUp, Notion y Asana sin reemplazar la app existente. La nueva ruta `/app/workspace` centraliza proyectos, tareas, timeline, tabla, canvas, archivos y reportes como views dinámicas del mismo contexto operativo.

## Base

- Base anterior: v58.25.7.7 — Boards Hero + Template Icons + Notifications Metric Polish.
- No se eliminan rutas actuales: `/app/tasks`, `/app/projects`, `/app/boards`, `/app/reports` siguen funcionando.
- No se agregan migraciones ni tablas nuevas en esta fase.

## Cambios principales

### Nueva ruta

- `src/app/(app)/app/workspace/page.tsx`
- Carga datos reales con `getTasks`, `getProjects` y `getReportsOverview`.
- Soporta `?view=` para cambiar de vista sin sensación de página separada.
- Soporta `?projectId=` para filtrar tareas por proyecto.

### Nueva capa de componentes

- `src/components/workspace-system/workspace-system-page.tsx`
- `src/components/workspace-system/workspace-sidebar-pro.tsx`
- `src/components/workspace-system/workspace-context-header.tsx`
- `src/components/workspace-system/workspace-view-tabs.tsx`
- `src/components/workspace-system/workspace-right-panel.tsx`
- `src/components/workspace-system/workspace-badges.tsx`

### Views dinámicas

- Lista: agrupa tareas reales por En curso, Pendiente y Completadas.
- Board: columnas compactas por estado.
- Timeline: vista visual basada en tareas con fecha.
- Tabla: tabla operativa con estado, responsable, prioridad, fecha y progreso.
- Canvas: foundation visual listo para conectar `BoardPage`.
- Archivos: placeholder controlado para adjuntos/documentos.
- Reportes: vista compacta usando `ReportsOverview` y tareas del contexto.

### Frontend adapters

- `src/lib/workspace-system/view-state.ts`
- `src/lib/workspace-system/adapters.ts`

Los adapters normalizan `TaskSummary` y `ProjectSummary` hacia modelos `WorkspaceTaskItem` y `WorkspaceProjectSummary` sin cambiar la base de datos.

### CSS

Se agregan tokens `ft-ws-*` al final de `src/app/globals.css` sin borrar estilos existentes.

## Decisiones técnicas

- No crear `workspace_spaces` ni `project_views` en v58.25.8.
- No instalar dependencias nuevas.
- No duplicar módulos existentes de tareas, proyectos, pizarras o reportes.
- Mantener el sistema visual premium: `#F6F8FB`, `#FFFFFF`, `#E5EAF1`, `#0F172A`, `#64748B`, `#16C784`.

## Validación esperada

```bash
npm run verify:current
npm run typecheck
npm run build:preflight
npm run build
```

## Próxima versión sugerida

v58.25.8.1 — Workspace Real Data Hardening

- Endurecer workspace personal vs organización.
- Mejorar filtrado por `projectId` y espacio.
- Conectar quick create real.
- Agregar acceso desde Project Detail hacia `/app/workspace?projectId=ID`.
