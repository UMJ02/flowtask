# FlowTask — v58.24.9.9 Visual System Cleanup + Apple Workspace UI Polish

Base: **v58.24.9.8 — Client Final Readiness + Global Modal System + Trash Recovery**

## Objetivo

Unificar la dirección visual de la app para que se sienta como un producto único, limpio y premium:

- Apple-like workspace surfaces.
- Claridad tipo Google Workspace.
- Dashboards operativos tipo monday.
- Tableros legibles tipo Trello.
- Menos estilos repetidos.
- Menos animaciones decorativas.
- Motion solo funcional.

## Cambios principales

### Visual system global

Se agregan tokens y clases en:

```txt
src/app/globals.css
```

Nuevas clases:

```txt
ft-app-bg
ft-surface
ft-surface-flat
ft-apple-card
ft-apple-panel
ft-apple-toolbar
ft-apple-button
ft-apple-button-primary
ft-apple-button-secondary
ft-apple-chip
ft-state-chip-progress
ft-state-chip-production
ft-state-chip-waiting
ft-state-chip-done
ft-motion-functional
ft-hover-lift
ft-skeleton-line
```

### Pantallas pulidas

Se aplicó el nuevo sistema en:

```txt
/app/tasks
/app/tasks/trash
TaskActionList
TaskKanbanBoard
WorkspaceHome
TaskWorkspaceInline
```

### Guía visual

Se agrega:

```txt
docs/design/FLOWTASK_VISUAL_SYSTEM_V58_24_9_9.md
```

## Validación recomendada

```bash
npm install
npm run verify:v58.24.9.9
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
