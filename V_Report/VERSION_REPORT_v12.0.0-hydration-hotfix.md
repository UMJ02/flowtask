# Flowtask V12 — Hydration Hotfix

## Objetivo
Atacar el error React 418 reportado en navegador después de haber resuelto el build y el hotfix inicial de RLS.

## Cambios aplicados

### 1) Render dinámico explícito del área autenticada
Se agregó:
```ts
export const dynamic = 'force-dynamic';
```
en el layout autenticado y en las páginas del subtree `/app/(app)/app` para evitar deriva entre intento de estático y rutas que dependen de `cookies`.

### 2) Remoción de timestamps inestables durante render
Se reemplazaron usos de:
- `new Date().toISOString()`

por valores estables basados en datos reales de la entidad (`updated_at`, `created_at`, `due_date`) o un fallback fijo.

Esto se aplicó en:
- `task-list`
- `task-detail-summary`
- `project-detail-summary`
- `project-sidebar`
- `interactive-dashboard-board`

## Resultado esperado
Reducir significativamente el riesgo de hydration mismatch en las rutas principales del workspace.

## Nota honesta
Este hotfix está enfocado a los sospechosos más fuertes detectados con la evidencia disponible. Si el 418 persiste, el siguiente paso será aislar el componente exacto en la ruta que lo dispara en dev mode.
