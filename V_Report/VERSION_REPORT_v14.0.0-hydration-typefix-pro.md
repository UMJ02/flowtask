# Flowtask V14 — Hydration + Typefix Pro

## Objetivo
Corregir de forma sólida el type error pendiente en `interactive-dashboard-board` y dejar una pasada adicional de estabilidad para el error React 418.

## Cambios aplicados
- Se agregó `updated_at?: string | null` al tipo `TaskRow`.
- Se reemplazaron timestamps generados durante render por valores estables basados en datos reales.
- Se forzó render dinámico en el subtree autenticado para evitar deriva entre estático y rutas con `cookies`.
- Se estabilizaron componentes de:
  - board interactivo
  - lista de tareas
  - detalle de tarea
  - detalle de proyecto
  - sidebar de proyectos

## Resultado esperado
- `npm run typecheck` debe pasar
- `npm run build` debe pasar
- se reduce el riesgo de hydration mismatch en rutas autenticadas

## Nota honesta
Si el React 418 persiste después de esta V14, el siguiente paso ya no será general sino de aislamiento del componente exacto en la ruta que falla.
