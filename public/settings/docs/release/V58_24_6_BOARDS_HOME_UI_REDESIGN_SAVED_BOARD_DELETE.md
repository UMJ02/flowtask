# v58.24.6 — Boards Home UI Redesign + Saved Board Delete

Base: v58.24.5 — Board Toolbar Collapse Animation Fix  
Estado: production-candidate

## Objetivo
Rediseñar `/app/boards` para alinearlo con la guía FlowTask — Pizarras Visuales: hero superior, plantillas rápidas, pizarras recientes y estética pastel premium inspirada en Miro, FigJam, Notion Canvas y Whimsical.

## Cambios
- Nuevo hero superior con CTA principal, CTA secundario y preview visual de canvas.
- Cards de plantillas con preview visual, color pastel y botón circular `+`.
- Cards de pizarras recientes con mini preview, fecha de edición y acción de eliminar.
- Modal de confirmación para eliminar pizarras guardadas.
- Eliminación como soft delete usando `visual_boards.deleted_at`.
- Sin migraciones nuevas.

## No cambia
- No toca Supabase schema.
- No toca RLS.
- No toca Storage.
- No toca Realtime.
- No cambia el editor `/app/boards/[boardId]`.
