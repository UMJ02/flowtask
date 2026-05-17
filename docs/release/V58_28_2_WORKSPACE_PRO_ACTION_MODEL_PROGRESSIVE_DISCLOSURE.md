# v58.28.2 — Workspace Pro Action Model + Progressive Disclosure

## Objetivo

Reducir ruido visual en Workspace Pro y reemplazar chips/botones repetidos por un modelo de interacción profesional: acción principal visible, acciones secundarias dentro de menú contextual y controles globales por vista.

## Cambios principales

- Board cards limpias: título, responsable/contexto, prioridad, fecha y menú `⋯`.
- Se eliminan acciones visibles repetidas tipo `Mover a Pendiente / En curso / En espera` dentro de cada tarjeta.
- Menú contextual por tarea con:
  - cambiar estado,
  - cambiar prioridad,
  - editar rápido,
  - abrir detalle,
  - editar completa.
- Vista Board arranca en modo limpio por defecto.
- Lista mantiene edición operativa con acción `Gestionar` en vez de repetir botones por fila.
- Espacios se rediseña como pantalla final-user:
  - título `Espacios`,
  - ayuda clara,
  - diagnóstico técnico oculto en `details`,
  - asignación de proyectos bajo disclosure.
- Se conserva drag/drop, edición rápida, render diet, visual density, production UX y user final UI.

## No incluido

- No hay migraciones nuevas.
- No se toca RLS.
- No se toca `safe_delete_visual_board`.
- No se cambian rutas clásicas.
- No se agregan dependencias.

## Scripts

- `verify:v58.28.2`
- `workspace:action-model:ready`
- `build:preflight` incluye `workspace:action-model:ready`
