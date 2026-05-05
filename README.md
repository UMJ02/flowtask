# FlowTask — v58.19.9 Supabase Live QA + Vercel Verify Fix

Consolidación del core sobre V58.16.4: Tareas queda como módulo de tareas simples, Proyectos administra tareas internas inline y cualquier tarea con `project_id` vuelve al Project Center para evitar mezclar flujos. Mantiene media system, timeline full width con Builder ocultable, Ver Proyecto premium y datos conectados.

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
