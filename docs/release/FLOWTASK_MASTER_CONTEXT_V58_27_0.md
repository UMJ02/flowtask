# FlowTask Master Context — v58.27.0

## Estado
FlowTask queda como Client Final Release Candidate de la línea Workspace-First.

## Filosofía
La app evoluciona de módulos separados a un sistema operativo de trabajo:

Workspace → Espacios → Proyecto → Views dinámicas.

## Views
- Home
- Lista
- Board
- Timeline
- Tabla
- Canvas
- Archivos
- Reportes

## Persistencia
- `workspace_spaces`: espacios del workspace.
- `project_views`: vistas guardadas, defaults y config.
- `workspace_space_projects`: asignación de proyectos a espacios.

## Migraciones requeridas
- 0056 Workspace Persistence Foundation.
- 0057 Workspace Space Project Assignments.
- 0058 Home View Support.
- 0059 Real Environment Hardening.

## Reglas de oro
- No reemplazar rutas clásicas hasta validar cliente final.
- No duplicar BoardPage.
- Usar `safe_delete_visual_board` para borrar pizarras.
- Mantener RLS como fuente de verdad.
- Links internos no saltan permisos.
- Workspace debe funcionar en modo personal y organización.

## Validación final
Usar:

```bash
npm run workspace:release-candidate:ready
npm run verify:current
npm run build:preflight
npm run build
```
