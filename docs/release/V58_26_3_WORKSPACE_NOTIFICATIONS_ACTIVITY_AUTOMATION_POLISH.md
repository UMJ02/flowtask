# v58.26.3 — Workspace Notifications + Activity Automation Polish

## Objetivo

Pulir la capa Workspace-First para que el panel contextual combine notificaciones reales, actividad reciente y señales de automatización sin crear migraciones nuevas ni reemplazar módulos existentes.

## Cambios incluidos

- Nuevo tipo `WorkspaceNotificationSummary`.
- Nuevo helper server-safe `getWorkspaceNotificationDigest()`.
- `buildWorkspaceLoadPlan()` ahora contempla `notifications` para evitar cargar notificaciones cuando la vista no las necesita.
- Nuevo componente `WorkspaceNotificationsAutomationPanel`.
- Right Panel ahora muestra señales de automatización contextual basadas en:
  - tareas vencidas,
  - tareas importantes,
  - tareas de hoy,
  - archivos recientes,
  - actividad reciente,
  - notificaciones sin leer.
- `/app/workspace` carga notificaciones de forma progresiva según vista activa.
- CSS nuevo para tarjetas de automatización y mini notificaciones.
- Nuevo script `workspace:automation:ready`.

## Sin cambios de BD

Esta versión no agrega migraciones. Reutiliza tablas existentes:

- `notifications`
- `activity_logs`
- `tasks`
- `attachments`
- `project_views`
- `workspace_spaces`

## Validación recomendada

```bash
npm run workspace:automation:ready
npm run verify:current
npm run workspace:doctor
npm run workspace:production:ready
npm run workspace:real-env:ready
npm run workspace:performance:ready
npm run typecheck
npm run build:preflight
npm run build
```
