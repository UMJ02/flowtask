# FlowTask v58.26.1 — Workspace Real Environment QA

## Validación CLI

```bash
npm run workspace:doctor
npm run workspace:production:ready
npm run workspace:real-env:ready
npm run verify:current
npm run typecheck
npm run build:preflight
npm run build
```

## Validación funcional

En `/app/workspace` validar:

- Carga Home por defecto.
- Lista, Board, Timeline, Tabla, Canvas, Archivos y Reportes abren sin error.
- Command Center abre con `⌘K` / `Ctrl+K`.
- Crear tarea inline funciona si el usuario tiene permisos.
- Guardar vista funciona cuando `project_views` está disponible.
- Crear espacio y asignar proyecto funciona cuando `workspace_space_projects` está disponible.
- Estados de solo lectura bloquean acciones sin usar `alert` nativo.
- Mobile drawer abre/cierra sin romper navegación.

## Validación de entorno real

- Usar Node 20 para build/deploy.
- Variables `.env` reales deben pertenecer al mismo Supabase ref.
- `build:preflight` debe pasar con `.env` real.
- Vercel debe tener las mismas variables requeridas.

## Casos críticos

- Usuario personal sin organización.
- Usuario organización admin/manager.
- Usuario miembro con permisos limitados.
- Proyecto sin tareas.
- Proyecto sin vistas guardadas.
- Proyecto con archivos y pizarras.
