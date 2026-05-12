# FlowTask — Workspace Board Column Visibility Pattern

La vista de Workspace puede mostrar muchas columnas por estado. Para evitar ruido visual, el usuario puede elegir qué columnas ver sin modificar datos ni filtros globales.

## Principios

- Control compacto.
- Sin ocupar espacio vertical permanente.
- Preferencia local por workspace.
- Mínimo una columna visible.
- No cambia el estado real de tareas.

## Uso

- Ubicación: header de **Mi flujo de trabajo**.
- Label: `Columnas`.
- Opciones: En progreso, Producción, En espera, Hecho.
- Persistencia: `localStorage`.

## No hacer

- No aplicar esta selección a `/app/tasks`.
- No guardar en Supabase todavía.
- No ocultar todas las columnas.
