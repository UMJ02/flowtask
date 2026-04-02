# Flowtask V16 — Dashboard Cleanup + Board Move

## Objetivo
Limpiar el dashboard principal sacando el bloque de pizarra interactiva y moverlo a una página dedicada, sin romper la base estable de V15.

## Cambios aplicados
- Se creó la nueva ruta:
  - `/app/board`
- Se movió la pizarra interactiva a una página dedicada usando el componente existente:
  - `InteractiveDashboardBoard`
- Se limpió el dashboard:
  - se removió el bloque grande de pizarra/notas rápidas/agenda
  - se reequilibró el layout con métricas, proyectos, actividad y carga
- Se agregó botón de acceso a **Pizarra** en el sidebar.
- Se actualizaron accesos directos para abrir la nueva ruta.

## Resultado esperado
- Dashboard más limpio y ejecutivo
- Pizarra separada como espacio de trabajo propio
- Navegación más clara desde sidebar
