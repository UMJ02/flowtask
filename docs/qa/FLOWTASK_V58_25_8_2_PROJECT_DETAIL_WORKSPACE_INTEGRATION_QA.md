# QA — v58.25.8.2 Project Detail Workspace Integration

## Checklist técnico

- [ ] `npm run verify:current` pasa y apunta a `verify:v58.25.8.2`.
- [ ] `npm run typecheck` pasa.
- [ ] `npm run build:preflight` pasa con `.env` real.
- [ ] `npm run build` pasa con Node 20.
- [ ] No se agregaron migraciones.
- [ ] No se instalaron dependencias nuevas.

## QA de navegación

- [ ] Desde `/app/projects`, el botón `Vista Workspace` abre `/app/workspace`.
- [ ] Desde cada fila de proyecto, el ícono Workspace abre `/app/workspace?projectId=ID&view=list`.
- [ ] El botón de detalle clásico sigue abriendo `/app/projects/[id]`.
- [ ] El botón editar sigue abriendo el modo edición del proyecto.
- [ ] Desde `/app/projects/[id]`, el botón `Abrir workspace` abre el proyecto filtrado en Workspace.
- [ ] El bloque `Workspace integrado` muestra accesos a Board, Timeline, Tabla, Canvas y Reportes.
- [ ] Cada acceso conserva el `projectId` correcto.

## QA de datos reales

- [ ] En Workspace, el header muestra el título real del proyecto.
- [ ] La vista Lista muestra solo tareas de ese proyecto.
- [ ] La vista Board agrupa las tareas reales del proyecto.
- [ ] La vista Timeline solo usa tareas del proyecto con fecha.
- [ ] La vista Tabla solo lista tareas/registros del proyecto.
- [ ] La vista Reportes mantiene el resumen contextual.
- [ ] Si se pasa un `projectId` inválido, aparece alerta y no se muestran datos cruzados.

## QA visual

- [ ] El hero del detalle no se rompe con el nuevo CTA.
- [ ] El bloque `Workspace integrado` no genera cards gigantes.
- [ ] Los accesos a views se ven compactos.
- [ ] En móvil, los botones hacen wrap sin overflow.
- [ ] La lista de proyectos mantiene densidad y acciones claras.

## QA de no regresión

- [ ] `/app/tasks` sigue funcionando.
- [ ] `/app/projects` sigue funcionando.
- [ ] `/app/projects/[id]` sigue funcionando.
- [ ] `/app/boards` sigue funcionando.
- [ ] `/app/reports` sigue funcionando.
- [ ] No se toca `safe_delete_visual_board`.
- [ ] No se crean `workspace_spaces` ni `project_views`.
