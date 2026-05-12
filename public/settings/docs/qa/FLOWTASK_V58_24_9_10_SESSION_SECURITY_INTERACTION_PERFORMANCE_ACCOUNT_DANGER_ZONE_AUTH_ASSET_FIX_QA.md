# QA — v58.24.9.10 Session Security + Interaction Performance + Account Danger Zone + Auth Asset Fix

## 1. Auth confirm asset

1. Confirmar que existe `public/check/confirmacion.png`.
2. Abrir `/confirmed`.
3. Confirmar que la imagen aparece.

## 2. Idle logout

1. Entrar a la app.
2. Confirmar que `IdleSessionGuard` está montado.
3. Para QA manual se puede bajar temporalmente `IDLE_LIMIT_MS`.
4. Confirmar redirección a `/login?reason=idle`.
5. Confirmar mensaje de sesión cerrada.

## 3. Settings Danger Zone

1. Abrir `/app/settings`.
2. Confirmar card `Zona de peligro`.
3. Click `Eliminar cuenta`.
4. Confirmar que exige escribir `ELIMINAR`.
5. Confirmar que llama `/api/account/delete`.

## 4. Scroll/performance

1. Abrir pantallas largas.
2. Confirmar que el scroll no se queda pegado.
3. Confirmar que skeleton shimmer no rompe `prefers-reduced-motion`.

## 5. Sidebar colapsado

1. Colapsar sidebar.
2. Click en avatar.
3. Confirmar que navega a perfil y no abre menú ancho roto.

## 6. CLI

```bash
npm install
npm run verify:v58.24.9.10
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
