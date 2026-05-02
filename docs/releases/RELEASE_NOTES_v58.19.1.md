# Flowtask v58.19.1 — Lottie Transition Overlay

Base: `Flowtask v58.19 Auth Transition Overlay`.

## Cambios aplicados

1. Transiciones públicas con animación local:
   - Se reemplazó el card de loader anterior por una animación centrada.
   - Se mantiene el fondo blanco/mint con blur difuminado.
   - Se elimina la tarjeta/borde/sombra del cuadro anterior.

2. Archivo local para producción:
   - `public/animations/flowtask-loading.webm`
   - `public/animations/flowtask-loading.mp4`
   - No depende de `lottie.host` ni de paquetes externos nuevos.

3. Textos por contexto:
   - Inicio: `Cargando inicio…`
   - Registro: `Cargando registro…`
   - Ingreso: `Cargando ingreso…`
   - Workspace: `Cargando workspace…`

4. Duración:
   - Se mantiene transición de `2500ms`.

5. Dashboard / workspace:
   - El paso de entrada al workspace usa el mismo overlay premium con animación local.

## Archivos tocados

- `src/components/ui/auth-premium-loader.tsx`
- `src/components/public/public-transition-link.tsx`
- `src/app/(public)/loading.tsx`
- `src/app/(public)/login/loading.tsx`
- `src/app/(app)/app/loading.tsx`
- `src/app/(public)/page.tsx`
- `src/components/auth/login-form.tsx`
- `src/components/auth/register-form.tsx`
- `public/animations/flowtask-loading.webm`
- `public/animations/flowtask-loading.mp4`

## Validación local recomendada

```bash
rm -rf node_modules .next
npm ci
npm run typecheck
npm run build
```

## Nota de validación en entorno ChatGPT

Se intentó ejecutar `npm run typecheck`, pero la instalación de dependencias del entorno quedó incompleta y faltaron tipos base (`@types/node`, `@types/react`, `@types/react-dom`). No se detectó un problema de código en los cambios de loader; se recomienda validar en el entorno local con Node 20.x y `npm ci` limpio.
