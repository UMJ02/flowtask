# FlowTask v58.27.2 — Workspace Pro Design Reset + Enterprise UI System

## Objetivo

Reiniciar la capa visual de `/app/workspace` para que se sienta más profesional, sobria y usable, sin depender del diseño Workspace acumulado en versiones anteriores.

## Principios

- No agregar más funciones visibles por defecto.
- No mostrar debug, migraciones, health checks ni detalles RLS al usuario final salvo error real.
- Reducir duplicación de métricas, permisos, actividad y archivos.
- Mantener la lógica validada de tareas, proyectos, espacios, vistas guardadas, archivos, pizarras y permisos.
- Usar una UI enterprise/Apple-like: menos colores, menos cards, texto corto, acciones agrupadas.

## Cambios principales

- Nuevo componente `src/components/workspace-pro/workspace-pro-page.tsx`.
- `WorkspaceSystemPage` ahora delega en `WorkspaceProPage` para mantener compatibilidad con la ruta y los datos existentes.
- Nuevo sistema CSS `ws-pro-*` independiente de la capa visual anterior `ft-ws-*`.
- Sidebar más compacto: principal, espacios, proyectos y vistas guardadas.
- Header contextual compacto con CTA principal, compartir y búsqueda.
- Tabs pequeñas tipo barra de vistas.
- Home reducido a portada operativa: métricas mínimas, tareas importantes, vencimientos, recursos y actividad.
- Right panel reducido a resumen, próximos vencimientos, equipo, actividad y señales.
- Se mantienen los managers existentes, pero solo se abren bajo demanda.

## No incluido

- No hay migraciones nuevas.
- No hay cambios de RLS.
- No se reemplazan rutas clásicas.
- No se agrega dependencia nueva.
- No se toca `safe_delete_visual_board`.

## Validación

```bash
npm run workspace:design-reset:ready
npm run verify:current
npm run typecheck
npm run build:preflight
npm run build
```
