# FlowTask v1.0.0-canon

## Cambios aplicados
- Corrección completa del typecheck.
- Normalización de rutas mediante helper central.
- Sanitización del redirect post-login.
- Corrección del panel de notificaciones en vivo.
- Corrección del chequeo de permisos `canUser()`.
- Tipado explícito de cookies en Supabase SSR.
- Limpieza de tipos base de base de datos.

## Archivos clave tocados
- `src/lib/navigation/routes.ts`
- `src/components/auth/login-form.tsx`
- `src/components/dashboard/*`
- `src/components/layout/*`
- `src/components/notifications/*`
- `src/components/projects/*`
- `src/components/tasks/*`
- `src/lib/permissions/checks.ts`
- `src/lib/supabase/middleware.ts`
- `src/lib/supabase/server.ts`
- `src/types/database.ts`
- `README.md`

## Validación
- `npm run typecheck` ✅
