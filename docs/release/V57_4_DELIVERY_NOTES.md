# V57.4 — Profile / Settings Separation

## Objetivo
Separar **ver y editar perfil** de **settings** para que cada vista tenga una responsabilidad clara y una experiencia más limpia para cliente final.

## Cambios principales
- nueva ruta dedicada: `/app/profile`
- settings deja de mezclar identidad del usuario con preferencias de la aplicación
- perfil ahora concentra:
  - nombre visible
  - correo visible
  - imagen del perfil por URL
  - cambio de contraseña
- textos de settings actualizados para hablar de **aplicación** en lugar de **operativa**
- accesos rápidos de perfil redirigidos a `/app/profile`

## Archivos clave
- `src/app/(app)/app/profile/page.tsx`
- `src/app/(app)/app/settings/page.tsx`
- `src/components/settings/profile-settings-form.tsx`
- `src/components/settings/settings-account-overview.tsx`
- `src/components/layout/user-menu.tsx`
- `src/components/layout/sidebar-footer.tsx`
- `src/lib/queries/profile.ts`

## Validación de release
- `node scripts/verify-v57.4.mjs`
