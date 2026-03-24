# FlowTask v6.0.4-env-binding-fix

## Base
Derivada de `v6.0.3-release-hardening`.

## Objetivo
Corregir el binding real de variables `NEXT_PUBLIC_*` en el cliente para que la app lea bien el entorno en navegador y no caiga completa por Realtime Notifications.

## Cambios aplicados
- corrección de lectura de entorno en `src/lib/runtime/env.ts`
  - antes usaba acceso dinámico `process.env[key]`
  - ahora usa referencias directas `process.env.NEXT_PUBLIC_*`, compatibles con el bundle cliente de Next.js
- resiliencia extra en `src/hooks/use-notifications-realtime.ts`
  - si falta entorno en cliente, Realtime se desactiva sin romper toda la app
- mejora de `scripts/runtime-check.mjs`
  - ahora advierte si la clave pública parece ser una `service_role`
- actualización de versión y documentación

## Validación ejecutada
- la causa raíz del error reportado fue revisada contra el log del usuario
- el fallo coincide con lectura dinámica de `NEXT_PUBLIC_*` en cliente y crash dentro de `NotificationsProvider`
- esta versión ataca exactamente ese punto

## Nota de release
No se hardcodearon credenciales del usuario en el proyecto. La app vuelve a leer correctamente las variables públicas desde `.env.local`, y además evita caerse completa si Realtime no puede inicializarse.
