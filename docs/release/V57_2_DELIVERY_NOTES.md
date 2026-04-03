# V57.2 — Notifications UX Polish

Base: V57.1 notifications refinement.

## Ajustes aplicados
- Se elimina el card de “Política activa” para limpiar la cabecera de notificaciones.
- `Notification command` queda como bloque principal de ancho completo con la prueba rápida integrada.
- `Centro de notificaciones` adopta una superficie visual diferenciada.
- Los botones de acción se reubican al lado izquierdo y se separan del listado con una línea divisora.
- El buscador principal queda en una sola línea y la búsqueda avanzada se expone como bloque desplegable.
- Se corrige el flujo de `Enviar prueba` mediante la nueva ruta `POST /api/notifications/test`.
- Se agrega `POST /api/notifications/archive-read` para evitar rutas rotas en el archivado de leídas.

## Archivos clave
- `src/components/notifications/notifications-command-center.tsx`
- `src/components/notifications/notifications-live-panel.tsx`
- `src/app/api/notifications/test/route.ts`
- `src/app/api/notifications/archive-read/route.ts`
- `src/lib/supabase/admin.ts`
- `src/lib/release/version.ts`
