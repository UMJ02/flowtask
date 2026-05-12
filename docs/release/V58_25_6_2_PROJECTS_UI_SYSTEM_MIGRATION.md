# v58.25.6.2 — Projects UI System Migration

**Base:** v58.25.6.1 — Tasks + Kanban UI System Migration

## Objetivo

Migrar Proyectos al sistema madre de UI para que el módulo deje de tener estilos aislados y use la misma arquitectura de Tareas, Settings, Notifications y Registros.

## Alcance aplicado

### Listado
- `ft-projects-screen`
- `ft-projects-hero`
- `ft-projects-panel`
- `ft-projects-filter-panel`
- `ft-projects-stat-grid`
- `ft-project-metric-card`
- `ft-project-title`
- `ft-project-copy`
- `ft-project-action`

### Detalle
- `ft-project-detail-panel`
- `ft-project-chip`
- `ft-project-metric-card`

### Formulario
- `ft-project-form-panel`
- controles globales de inputs/selects/buttons

### Tareas internas
- `ft-project-inline-task-row`

### Timeline
- `ft-project-timeline-panel`
- `ft-project-timeline-row`

## Decisiones UX/UI

- Métricas más compactas y alineadas.
- Botones con una sola arquitectura de acción.
- Detalle y formulario con paneles del sistema.
- Se reducen radios, sombras y bordes específicos.
- Se preservan workflows y Supabase.
