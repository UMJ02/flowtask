# v58.27.6 — Workspace Pro Deep Cleanup + 2026 UI Controls System

Esta versión depura el Workspace Pro con foco en experiencia, consistencia visual y rendimiento percibido.

## Cambios clave

- Command Center y Share Panel ahora se montan solo cuando se abren.
- Se elimina render duplicado del panel derecho.
- Home vuelve a renderizar la vista Home real cuando `view=home`.
- Se agrega `WorkspaceProFilterBar` para reemplazar selectores sueltos por controles compactos y consistentes.
- Se agrega `WorkspaceProControlSelect` como base para selects de Workspace Pro.
- Se refuerza CSS `ws-pro-*` sin tocar estilos globales de la app clásica.
- `build:preflight` ahora incluye `workspace:deep-cleanup:ready`.

## Sin cambios de base de datos

No agrega migraciones, no cambia RLS y no toca Supabase schema.
