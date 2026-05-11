# FlowTask — v58.24.9.10 Session Security + Interaction Performance + Account Danger Zone + Auth Asset Fix

Base: **v58.24.9.9.1 — Visual Style Deduplication + Motion Cleanup Pass**

## Objetivo

Corregir puntos visibles de UX/performance y agregar seguridad de sesión:

- Auto logout por inactividad de 15 minutos.
- Skeleton shimmer más pro.
- Opción de eliminar cuenta en Settings.
- API server-side para solicitar eliminación de cuenta.
- Fix de imagen en página de cuenta confirmada.
- Mejoras de scroll/performance.
- Menú colapsado del sidebar se mantiene compacto y sin dropdown roto.

## Cambios principales

### Session security

Nuevo componente:

```txt
src/components/auth/idle-session-guard.tsx
```

Se monta en `AppShell`. Si el usuario queda inactivo 15 minutos:

```txt
signOut
redirect /login?reason=idle
mensaje de seguridad en login
```

### Account danger zone

Nuevo componente:

```txt
src/components/settings/account-danger-zone.tsx
```

Nuevo endpoint:

```txt
src/app/api/account/delete/route.ts
```

Nueva migración:

```txt
supabase/migrations/0054_v58_24_9_10_account_deletion_status.sql
```

La acción requiere escribir:

```txt
ELIMINAR
```

### Auth asset fix

Se agrega:

```txt
public/check/confirmacion.png
src/app/(public)/confirmed/page.tsx
```

La imagen se referencia como:

```txt
/check/confirmacion.png
```

### Skeleton / performance

Se agregan:

```txt
ft-skeleton-card
ft-skeleton-line shimmer
ft-scroll-stable
```

## Validación recomendada

```bash
npm install
npm run verify:v58.24.9.10
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
