# FlowTask v58.18.7 — Auth Stability + Loading Cleanup

Base: `flowtask_V58.18.6_Email_Confirm_Flow_FULL`.

## Cambios aplicados

- Login y registro ahora tienen control de visibilidad de contraseña con icono de ojito.
- Se removió el loader con lottie/carita de `BrandLoader`; las cargas usan skeletons simples con texto claro.
- `LoadingState` ya no depende de animaciones externas ni scripts remotos.
- Login y registro usan validación reactiva `mode: 'onChange'` y `reValidateMode: 'onChange'`.
- Los errores de campo y errores de servidor se limpian cuando el usuario corrige el campo correspondiente.
- Registro limpia los campos después de un `signUp` exitoso, sin quitar `autocomplete`.
- Registro conserva un solo modal/toast: “Revisa tu correo”. Se eliminó el segundo aviso de redirección.
- Registro redirige al login después del aviso, sin enviar al dashboard.
- Confirmación de correo hace `verifyOtp`, luego `signOut`, y redirige a `/confirmed`; así evita que la validación deje sesión activa y mande al dashboard.
- Se agregó detección de rate limit de Supabase en login/register con contador visual y bloqueo temporal por correo.

## Archivos principales modificados/agregados

- `src/components/auth/login-form.tsx`
- `src/components/auth/register-form.tsx`
- `src/components/auth/auth-password-field.tsx`
- `src/components/auth/auth-cooldown-notice.tsx`
- `src/lib/auth-rate-limit.ts`
- `src/components/ui/brand-loader.tsx`
- `src/components/ui/loading-state.tsx`
- `src/app/auth/confirm/route.ts`

## Validación pendiente

El ZIP fue generado con cambios quirúrgicos. Para validación final local/prod ejecutar:

```bash
rm -rf node_modules .next
npm ci
npm run typecheck
npm run build
```

Usar Node 20.x por el engine del proyecto.
