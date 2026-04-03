# FlowTask v9.0.0 — Stability Core

## Enfoque
Primera pasada de estabilización enfocada en navegación, SSR/App Router y acceso real al workspace.

## Cambios aplicados
- Eliminado el uso de `useSearchParams()` en login, workspace de tareas y panel de notificaciones para evitar fallos de render en App Router y reducir dependencias de Suspense.
- Login ahora recibe `next` desde el server page y lo sanea antes de redirigir.
- Workspace de tareas ahora preserva filtros al cambiar entre vista kanban y lista sin depender del estado del router en cliente.
- Centro de notificaciones ahora recibe `filter` y `q` desde el server page y sincroniza la URL con rutas controladas.
- Ajustado el alcance de consultas del workspace para no restringir artificialmente tareas/proyectos visibles cuando el acceso real ya lo resuelve RLS.

## Impacto esperado
- Menos riesgo de errores de build/render relacionados con `useSearchParams()`.
- Flujo más estable en login -> dashboard -> tareas/notificaciones.
- Mejor visibilidad de registros accesibles por colaboración y RLS.

## Limpieza del paquete
- Base preparada para nuevo zip sin `__MACOSX`, `.git`, `node_modules`, `.next`, `.env`, `.env.local`.
