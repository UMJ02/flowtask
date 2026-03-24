# VERSION REPORT — v6.0.5-workspace-route-fix

## Objetivo
Eliminar el bloqueo 404 al entrar a la vista principal privada.

## Cambios
- Se adopta `/app/dashboard` como ruta canónica de entrada del shell privado.
- Se alinean middleware, navegación, command palette y enlaces internos al nuevo destino canónico.
- `dashboard/page.tsx` ahora reutiliza directamente la pantalla del workspace para mantener la misma experiencia sin duplicar lógica.
- Se actualiza `safeInternalRoute` y `buildRouteWithQuery` para usar `/app/dashboard` como fallback seguro.
- Se actualiza `public/manifest.webmanifest` para que el inicio de la PWA no apunte a una ruta que pueda caer en 404.

## Resultado esperado
- Usuarios autenticados aterrizan en `/app/dashboard`.
- La experiencia visible sigue siendo el Workspace principal.
- Navegación y accesos rápidos ya no dependen de `/app/workspace` como ruta de entrada.
