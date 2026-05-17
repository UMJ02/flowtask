# v58.27.9 — Workspace Pro Interaction Hardening + Real Editing Flow

Base: v58.27.8.1 — Workspace Pro Vercel Readiness Hotfix.

## Objetivo

Convertir el Workspace Pro en una experiencia más operativa y menos maqueta, reforzando acciones reales sin tocar Supabase, RLS, migraciones ni rutas clásicas.

## Cambios principales

- Home mantiene cards accionables hacia tareas, proyectos, canvas, archivos y reportes.
- Lista se convierte en vista editable pro con edición rápida de nombre, proyecto, estado, prioridad, fecha, borrado y acceso a detalle completo.
- Crear tarea/proyecto mantiene switch Tarea / Proyecto, checklist opcional y creación de tareas iniciales para proyectos.
- Board mantiene drag/drop real entre columnas, concluidas ocultables, columnas configurables, edición rápida y acceso a edición completa.
- Proyectos muestran tareas anidadas para evitar saturar la vista de tareas simples.
- Timeline usa `taskCompletionPercent` para representar avance operativo real por estado.
- Sheet de creación/edición usa layout con scroll interno más controlado para evitar desbordes raros.
- `build:preflight` incluye `workspace:real-editing:ready`.

## No incluido

- No hay migraciones nuevas.
- No se cambia RLS.
- No se toca `safe_delete_visual_board`.
- No se reemplazan rutas clásicas.
- No se agregan dependencias.
