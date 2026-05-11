# FlowTask — v58.24.9.5 Important Tasks UX + Analytics Separation

Base: **v58.24.9.4.1 — Kanban Important Tasks Typecheck Fix**

## Objetivo

Dejar la función de estrellas como una herramienta profesional de foco operativo, sin contaminar la analítica principal.

## Reglas de producto

- La estrella NO significa “favorita”.
- La estrella significa “Importante”.
- Importante se guarda como `priority = alta`.
- Quitar estrella devuelve la tarea a `priority = media`.
- Importante afecta el orden visual y el foco del usuario.
- Importante NO cambia estado, avance, productividad ni métricas duras.

## Cambios

### Kanban

- La estrella del Kanban confirma el update con Supabase usando `.select("id,priority,updated_at")`.
- Si Supabase confirma, actualiza el estado local y notifica al dashboard.
- Si falla, revierte el cambio.
- Las tareas importantes siguen apareciendo arriba dentro de su columna.

### Dashboard / Analítica

- El KPI `Importantes` se define como señal de foco.
- Helper: `Foco, no avance`.
- El contador se actualiza al marcar/quitar estrella desde Kanban sin esperar refresh manual.

### Listado de tareas

- Se mantiene estrella en listado.
- Se agrega estado `importantOnly`.
- Se agrega botón `Solo importantes`.
- El listado sigue ordenando `priority = alta` primero.

## Validación recomendada

```bash
npm install
npm run verify:v58.24.9.5
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
