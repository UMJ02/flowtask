# FlowTask — v58.25.4 Notifications Center Redesign

Base: **v58.25.3 — Settings Width + Compact Hero/Metrics**

## Objetivo

Rediseñar la vista `/app/notifications` según el documento **FlowTask — Notification Center Redesign**, manteniendo funcionalidades existentes y asegurando que el contenido use todo el ancho disponible del header/app.

## Cambios principales

- Se elimina el hero oscuro de notificaciones.
- Nueva cabecera blanca premium con:
  - icono verde
  - título grande
  - subtítulo
  - métricas compactas de Pendientes y Entrega
- Nuevo shell `ft-notifications-shell` con `width: 100%` y `max-width: none`.
- Panel principal blanco con búsqueda, chips horizontales y feed claro.
- Chips principales:
  - Todas
  - No leídas
  - Menciones
  - Asignadas a mí
  - Actualizaciones
  - Sistema
- Chip activo verde.
- Notificaciones como cards blancas con icono colorido, pill de estado, hora y hover suave.
- Action bar inferior más limpia.

## Validación recomendada

```bash
npm install
npm run verify:v58.25.4
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
