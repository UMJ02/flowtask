# FlowTask V58.14.4 - Task Detail + Views Fix

Base: V58.14.3 Tareas Vistas 2026 FULL.

Cambios aplicados:
- Editar tarea: header/hero compactado para evitar desbordes y eliminado badge decorativo #FT-XXXX.
- Tareas / Vistas: dropdown Timeline elevado con z-index y overflow visible para que no quede detrás del card de filtros.
- Ver tarea / detalle: rediseño premium basado en guía PDF:
  - Hero de tarea con volver, título, estado, chips y acciones.
  - Card principal con tabs visuales: Detalles, Subtareas, Comentarios, Archivos y Bitácora.
  - Sidebar derecha sticky con Responsables, Fechas importantes, Archivos adjuntos y Etiquetas.
  - Se conserva lógica existente de comentarios, adjuntos, bitácora y navegación a editar.

No se tocó:
- Supabase schema
- migrations
- queries
- package.json
- vercel.json
