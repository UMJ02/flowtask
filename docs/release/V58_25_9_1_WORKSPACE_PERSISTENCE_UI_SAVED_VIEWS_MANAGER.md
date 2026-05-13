# v58.25.9.1 — Workspace Persistence UI + Saved Views Manager

## Objetivo
Agregar una interfaz real para usar la persistencia creada en v58.25.9 sin reemplazar la experiencia Workspace-First ni tocar rutas existentes.

## Cambios principales
- Nuevo componente `WorkspaceSavedViewsManager`.
- Botón `Vistas guardadas` en la action bar de `/app/workspace`.
- Guardado real de la vista activa en `project_views`.
- Renombrar vistas guardadas.
- Abrir una vista guardada dentro del mismo workspace.
- Marcar una vista como predeterminada por tipo.
- Eliminar vistas guardadas.
- Feedback inline de éxito/error sin `alert` nativo.
- CSS nuevo para tarjetas, inputs y acciones del manager.

## Reglas respetadas
- No reemplaza `/app/tasks`, `/app/projects`, `/app/boards` ni `/app/reports`.
- No agrega migraciones nuevas; usa `0056_v58_25_9_workspace_persistence_foundation.sql`.
- No instala dependencias nuevas.
- No duplica Boards ni Reportes.
- No toca `safe_delete_visual_board`.

## Validación manual
1. Abrir `/app/workspace?projectId=<ID>&view=list`.
2. Presionar `Vistas guardadas`.
3. Guardar la vista activa.
4. Confirmar que aparece una card de vista guardada.
5. Renombrar la vista.
6. Abrir la vista guardada.
7. Marcarla como default.
8. Eliminarla.
9. Confirmar que `router.refresh()` actualiza el listado.
