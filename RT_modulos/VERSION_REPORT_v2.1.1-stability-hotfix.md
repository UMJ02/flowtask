# FlowTask v2.1.1-stability-hotfix

## Base
Se construye sobre `v2.1.0-risk-radar`.

## Correcciones incluidas
- Corregido el 404 de `GET /api/notification-preferences/me` con una ruta de compatibilidad.
- Corregido el cliente para consultar `GET /api/notification-preferences`, que ya existía en la app.
- Ajustado el service worker para no cachear navegación SSR ni assets dinámicos de `/_next`.
- Nuevo nombre de caché para invalidar instalaciones viejas y reducir riesgo de hydration mismatch por bundles obsoletos.
- Registro del service worker actualizado con `updateViaCache: 'none'`.
- Sidebar fijado sobre una colección de navegación estática a nivel de módulo para mantener orden estable.

## Validación esperada
- Ya no debe aparecer 404 en `/api/notification-preferences/me`.
- El riesgo de mismatch entre HTML SSR y bundle cliente stale queda mitigado al dejar de cachear navegación y al invalidar cachés viejos.
