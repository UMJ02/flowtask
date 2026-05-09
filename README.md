# FlowTask — v58.21.5 Modern Density + Motion System

# FlowTask — v58.20 Task Workspace Inline Redesign

Consolidación del core sobre V58.16.4: Tareas queda como módulo de tareas simples, Proyectos administra tareas internas inline y cualquier tarea con `project_id` vuelve al Project Center para evitar mezclar flujos. Mantiene media system, timeline full width con Builder ocultable, Ver Proyecto premium y datos conectados.


## v58.20 Task Workspace Inline Redesign

Base oficial: v58.19.9 Supabase Live QA + Vercel Verify Fix.

Esta versión rehace la vista de tareas siguiendo el blueprint Task Workspace Inline:
- `/app/tasks/[id]` usa una sola experiencia de lectura/edición inline.
- `/app/tasks/[id]/edit` redirige a `?mode=edit` en la misma vista.
- Header limpio con estado, prioridad, progreso real y acciones principales.
- Descripción, estado, prioridad, cliente y deadline se editan dentro del workspace.
- Checklist protagonista: progreso inicia en 0% si no hay ítems.
- Comentarios y actividad se integran como Feed Operativo.
- Sidebar contextual simple: información, responsables, fechas y adjuntos.
- Se preservan XLSX real, landing pública limpia, Supabase readiness y aislamiento personal/organización.

## Checks recomendados

```bash
npm install
npm run typecheck
npm run build:preflight
npm run build
```

# FlowTask — V58.16.3 Ver Proyecto Premium 2026 Design Match

Rediseño afinado de Ver Proyecto basado en el PDF descriptivo: hero premium, KPI row, timeline con builder contenido, tareas internas inline, actividad humanizada y conexión a datos actuales.

# FlowTask — V58.16.2-ver-proyecto-premium-2026 Project Detail Tasks Inline Architecture

Media final para proyectos y clientes: imagen de proyecto en listado/detalle/form, avatar de cliente en registros y avatares, con migración `projects.image_url` y `clients.avatar_url` ya aplicada.

Workspace unificado: Radar inteligente, KPIs, Kanban central y widgets rápidos sobre la base estable V58.12.6.

# FlowTask — V58.12.6 Workspace Catalog + Delete Flow + Task/Project Form Fix

## Qué cambia en la V58.12.6
- Alinea la app con la migración `0038_v58_12_6_database_sanitization_foundation.sql`.
- Corrige el flujo de eliminación de registros/clientes usando RPC segura `delete_workspace_client`.
- Sanea catálogos de países y departamentos con unicidad por scope: global, personal y organización.
- Evita duplicados dentro del mismo workspace sin bloquear catálogos base compartidos.
- Ajusta formularios de tareas y proyectos para recargar y seleccionar correctamente país/departamento al editar.
- Mantiene el deploy de Vercel con `npm run vercel:build`, Node 20.x y `npm ci`.

## Deploy recomendado
1. Ejecutar la migración `0038` en Supabase si no se ha aplicado.
2. Validar localmente:

```bash
npm ci
npm run typecheck
npm run vercel:build
```

3. Subir a GitHub y desplegar en Vercel.
\n## V58.16.2-ver-proyecto-premium-2026 Project Detail Tasks Inline Architecture\n\nSeparación entre tareas simples y tareas hijas de proyectos.


## v58.21.1 — User Language + Interaction Cleanup

Patch de calidad UX sobre v58.21.0. Mejora textos, mensajes de error, tabs de proyecto y elimina elementos visibles que podían confundirse como funcionalidad real sin respaldo de datos. No agrega migraciones ni cambia contratos Supabase.



## v58.21.5 Modern Density + Motion System

Base visual global sobre v58.21.2. Normaliza tokens de diseño, tipografía, botones, inputs, cards, chips, espaciados y estados visuales principales para que la app se sienta más consistente y lista para usuario final. No agrega migraciones ni cambia contratos Supabase.

## v58.21.2 Layout Cleanup + Feed & Attachment Refinement

Pulido visual y de interacción sobre v58.21.1: feed operativo dividido, límites con “Ver más”, filtros de proyectos simplificados, thumbnails reales en adjuntos y tareas internas con layout responsive. No incluye migraciones ni cambios de RLS.


## v58.22.2 Task Status Production + Attachment List + Inline Department Edit

Semantic UI classes and density contracts now govern typography, layout rhythm, surfaces, controls and spacing across the core FlowTask app without Supabase/RLS changes.


## v58.22.2 Task Status Production + Attachment List + Inline Department Edit

Adds task status Producción, compact task attachment list mode, and inline department editing for task detail.
