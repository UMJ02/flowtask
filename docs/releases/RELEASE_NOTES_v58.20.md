# FlowTask v58.20 — Task Workspace Inline Redesign

Base oficial: v58.19.9 Supabase Live QA + Vercel Verify Fix.

## Objetivo
Rehacer la vista de tarea para que Crear, Editar y Ver evolucionen hacia una sola experiencia de Task Workspace, con edición inline, checklist protagonista, feed operativo y sidebar contextual simple.

## Cambios
- `/app/tasks/[id]` ahora renderiza Task Workspace Inline.
- `/app/tasks/[id]/edit` redirige a la misma vista con `?mode=edit`.
- El botón Editar activa edición inline dentro del mismo workspace.
- Se eliminan tabs/cards pesadas de Detalles/Comentarios/Adjuntos/Bitácora en la vista principal.
- Header limpio: volver, meta line, título, acciones y guardado.
- Descripción editable inline.
- Sidebar contextual simple: información, responsables, fechas y adjuntos compactos.
- Checklist inicia en 0% si no tiene pasos y calcula progreso real por ítems completados.
- Comentarios y actividad se presentan como Feed Operativo.
- Supabase, RLS, workspace personal/organización, XLSX y landing pública se preservan.
