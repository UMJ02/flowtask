# FlowTask V5.0.0 — Full Client Polish

## Enfoque
Esta versión se centró en pulido visible para cliente sobre el flujo core ya trabajado: dashboard, tareas y proyectos.

## Cambios aplicados
- Filtro nuevo de **prioridad** en tareas.
- Soporte end-to-end del filtro de prioridad en página, query server y cambio de vista lista/pizarra.
- Corrección de acceso rápido de prioridad para que use `priority=alta` en vez de una combinación inválida.
- Mejor búsqueda de tareas para contemplar título y cliente.
- Pulido del listado de tareas:
  - fechas formateadas
  - badges más claros
  - indicador de tarea independiente vs vinculada a proyecto
  - estado vacío con CTA real.
- Pulido del módulo de proyectos:
  - tarjetas con lectura más limpia
  - fechas formateadas
  - estado vacío con CTAs reales
  - métricas con helper text.
- Mejora visual global:
  - fondo más limpio
  - placeholders más suaves
  - scrollbar estilizado
  - empty states con mejor presencia.
- Tarjetas de filtros y métricas con mejor jerarquía visual en tareas.

## Nota técnica
Esta versión fue trabajada directamente sobre el zip V4 y se dejó lista como siguiente base del ciclo 1:1. La validación aquí fue estructural y de consistencia de código; no se ejecutó un build final completo contra tu entorno real Supabase dentro de este contenedor.
