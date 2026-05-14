# FlowTask Workspace Master Context — v58.26.0

## Estado
La línea Workspace-First queda consolidada como base de producción en v58.26.0.

## Arquitectura

```txt
Workspace → Espacio → Proyecto → Views dinámicas
```

Views:
- Home
- Lista
- Board
- Timeline
- Tabla
- Canvas
- Archivos
- Reportes

## Principios
- Workspace no borra rutas clásicas.
- Datos reales vienen de queries existentes y helpers server-safe.
- Persistencia se apoya en `workspace_spaces`, `project_views` y `workspace_space_projects`.
- Pizarras siguen usando el módulo existente.
- Borrado de pizarras sigue con `safe_delete_visual_board`.
- Las acciones sensibles tienen feedback profesional.
- La UI debe mantener densidad compacta y estilo premium.

## Base de Supabase requerida
- `0056_v58_25_9_workspace_persistence_foundation.sql`
- `0057_v58_25_9_4_workspace_space_project_assignments.sql`
- `0058_v58_25_9_5_project_views_home_view_support.sql`

## Siguiente línea sugerida
Después de validar v58.26.0 en local y Vercel, la siguiente etapa debe ser una línea v58.26.x de polish real con feedback de uso: performance, accesibilidad, permisos finos y mejoras de onboarding.
