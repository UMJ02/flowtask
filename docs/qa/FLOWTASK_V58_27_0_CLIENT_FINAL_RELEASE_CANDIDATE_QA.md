# QA — FlowTask v58.27.1 Release Candidate Fixes

## Validación local
```bash
cd ~/Documents/"Web Projects"/flowtask
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
npm run verify:current
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```

## QA Workspace
- Abrir `/app/workspace`.
- Confirmar Home como vista inicial cuando no hay `view` explícita.
- Cambiar entre Home, Lista, Board, Timeline, Tabla, Canvas, Archivos y Reportes.
- Guardar vista con filtros.
- Marcar vista como default.
- Abrir vista guardada.
- Crear tarea inline si el rol lo permite.
- Editar estado, prioridad y fecha inline.
- Crear espacio real.
- Asignar proyecto a espacio.
- Subir archivo.
- Abrir pizarra desde Canvas.
- Usar Command Center con `⌘K` / `Ctrl+K`.
- Copiar link de workspace, proyecto, vista y vista guardada.
- Validar empty states.
- Validar recovery panel con `savedViewId` inválido.

## QA rutas clásicas
- `/app/dashboard`
- `/app/tasks`
- `/app/projects`
- `/app/projects/[id]`
- `/app/boards`
- `/app/reports`
- `/app/notifications`
- `/app/settings`
- `/app/workspace`

## QA permisos
- Usuario owner.
- Usuario editor.
- Usuario viewer / solo lectura.
- Workspace personal.
- Workspace de organización.
- Proyecto con y sin organización.

## QA mobile
- Drawer del workspace.
- Tabs horizontales.
- Panel derecho/resumen.
- Command Center.
- Saved Views Manager.
- Spaces Manager.
- Share Panel.
- Files Upload Entry.
