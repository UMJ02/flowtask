# v58.28.18.2 — Dependency Security + Next Root Lockfile Guard

Base: v58.28.18.1 — Dependency Security Public Registry Lockfile Hotfix.

## Objetivo
Evitar que Next.js infiera como raíz del workspace un directorio padre cuando existe un `package-lock.json` fuera del proyecto, sin pedir al usuario borrar archivos de su carpeta personal.

## Cambios
- Mantiene Next.js `15.5.18`.
- Mantiene `npm audit --audit-level=moderate` limpio.
- Mantiene `package-lock.json` con registry público `registry.npmjs.org`.
- Agrega `outputFileTracingRoot: process.cwd()` en `next.config.ts` para fijar la raíz del tracing al proyecto actual.
- Agrega verificación `verify:v58.28.18.2`.
- Refuerza `workspace:dependency-security:ready` para validar el root guard.

## No cambia
- Supabase.
- RLS.
- Migraciones.
- UI.
- Sincronización Clásico/Pro.
- Rutas clásicas.
