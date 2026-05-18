# v58.28.14 — Workspace Pro Component Split + Runtime Slimdown Audit

Base estable: v58.28.13.

## Objetivo
Reducir el costo de interacción de Workspace Pro sin tocar Supabase, RLS, migraciones ni rutas clásicas.

## Cambios aplicados
- Se movió la construcción de URLs de vistas a `src/components/workspace-pro/workspace-pro-runtime.ts`.
- `openView` y `setWorkspaceParam` ahora usan callbacks estables.
- La vista activa se memoiza con `mainViewNode` para evitar recomputar el árbol central en cambios no relacionados.
- Las vistas principales quedan detrás de boundaries memoizados: Home, Lista, Proyectos, Board, Timeline, Tabla, Canvas, Archivos y Reportes.
- Se mantiene el cambio de vistas client-side introducido en la línea v58.28.x.

## Resultado esperado
- Menos renders accidentales del área central.
- Menos trabajo al abrir/cerrar panel derecho, sheets y controles globales.
- Navegación de vistas más estable antes de una futura división física por archivos.

## Pendiente recomendado
Para una fase posterior, separar físicamente Board/List/Home en archivos individuales si se decide seguir adelgazando `workspace-pro-page.tsx`.
