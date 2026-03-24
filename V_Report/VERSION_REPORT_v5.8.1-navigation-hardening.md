# FlowTask v5.8.1-navigation-hardening

Base: `v5.8.0-foundation`

## Objetivo
Cerrar la capa de navegación antes de seguir con consolidación funcional profunda, dejando rutas más seguras, estado activo consistente y accesos auxiliares mejor integrados.

## Cambios aplicados
- Se endureció `src/lib/navigation/routes.ts` con normalización de pathname, helpers para ruta activa y utilidades explícitas para workspace, intelligence, reportes, clientes, notificaciones, recordatorios, calendario y organización.
- `safeInternalRoute()` ahora conserva `search` y `hash` válidos, pero sigue bloqueando destinos externos o inválidos.
- Se agregó `isRouteActive()` para evitar inconsistencias entre sidebar, menú móvil y command palette.
- Sidebar desktop ahora muestra jerarquía más clara: core, organización y soporte operativo.
- Mobile nav replica esa jerarquía para mantener consistencia entre desktop y móvil.
- Command palette ahora deduplica comandos, marca estado activo por pathname real y suma accesos a notificaciones, recordatorios, calendario y búsqueda rápida de clientes.
- Middleware de Supabase preserva querystrings al enviar a login y redirige usuarios autenticados hacia `/app/workspace` en vez de la ruta vieja del dashboard.

## Archivos tocados
- `src/lib/navigation/routes.ts`
- `src/components/layout/nav-links.ts`
- `src/components/layout/app-sidebar.tsx`
- `src/components/layout/mobile-nav.tsx`
- `src/components/layout/command-palette.tsx`
- `src/lib/supabase/middleware.ts`
- `package.json`
- `package-lock.json`
- `README.md`
- `V_Report/VERSION_REPORT_v5.8.1-navigation-hardening.md`

## Validación honesta
- Se validó la base anterior antes de aplicar cambios.
- En este entorno no quedó certificada una corrida completa de `npm run typecheck` porque el proyecto no trae las dependencias instaladas dentro del contenedor de trabajo.
- La capa nueva quedó acotada a navegación y hardening, sin tocar flujos sensibles de datos.

## Resultado
Esta versión deja una base más segura para entrar a la siguiente etapa de consolidación funcional sin seguir arrastrando deuda de navegación.
