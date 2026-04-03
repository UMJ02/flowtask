# FlowTask v6.1.0-functional-hardening

## Objetivo
Endurecer los flujos core para que la app degrade mejor cuando fallen consultas, permisos o servicios secundarios.

## Cambios principales
- Se agregó `safeServerCall` para envolver consultas críticas del lado servidor con fallback controlado.
- El layout privado ahora tolera fallos parciales en perfil, organizaciones y conteo de notificaciones sin tumbar todo el shell.
- Las pantallas de `projects`, `tasks`, `clients` e `intelligence` ahora responden con `ErrorState` cuando la carga falla, en lugar de romper el render.
- El hook `useNotificationsRealtime` ya no intenta inicializar Realtime cuando el runtime público no está disponible o el cliente falla al crearse.

## Estado
- TypeScript validado.
- Base lista para seguir a consistencia de datos y cierre de build.
