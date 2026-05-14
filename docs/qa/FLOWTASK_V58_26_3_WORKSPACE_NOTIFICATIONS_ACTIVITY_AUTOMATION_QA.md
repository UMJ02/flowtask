# QA — FlowTask v58.26.3 Workspace Notifications + Activity Automation Polish

## Checklist funcional

- Abrir `/app/workspace?view=home`.
- Confirmar que el Right Panel muestra el bloque `Notificaciones + actividad`.
- Confirmar que las notificaciones sin leer se cuentan correctamente.
- Confirmar que las señales se adaptan a datos reales:
  - vencidas,
  - importantes,
  - hoy,
  - archivos,
  - actividad,
  - notificaciones.
- Confirmar que si no hay señales críticas aparece un estado saludable.
- Confirmar que el botón `Ver notificaciones` abre `/app/notifications`.
- Confirmar que `/app/workspace?view=list` no carga datos pesados innecesarios si el plan de carga no lo requiere.
- Confirmar que `/app/workspace?view=files` conserva actividad/notificaciones necesarias para contexto.

## Checklist técnico

- `WorkspaceNotificationSummary` existe en `view-state.ts`.
- `getWorkspaceNotificationDigest()` existe en `server-data.ts`.
- `buildWorkspaceLoadPlan()` incluye `notifications`.
- `WorkspaceNotificationsAutomationPanel` está montado en `WorkspaceRightPanel`.
- `workspace:automation:ready` pasa.
- No se agregaron migraciones.
- No se modificó RLS.
- No se reemplazaron rutas clásicas.

## Comandos

```bash
npm run workspace:automation:ready
npm run verify:current
npm run typecheck
npm run build:preflight
```
