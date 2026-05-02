# Flowtask v58.19 — Auth Transition Overlay Polish

Base: Flowtask v58.18.9 Public Transitions Checklist FULL

## Cambios incluidos

1. Transiciones públicas reducidas de 3.4s a 2.5s.
2. Loader premium de intro/login/register corregido para cubrir toda la pantalla.
3. Se eliminó el panel blanco grande que aparecía detrás del loader.
4. El loader ahora se renderiza en `document.body` mediante portal para evitar que quede atrapado dentro de cards, wrappers o contenedores con transform/blur.
5. Overlay con fondo blanco translúcido y blur global entre pantallas.
6. El cuadro pequeño de carga queda siempre centrado en viewport.
7. Se conserva el uso de `public/icons/icon.png` como marca del loader.

## Archivos modificados

- `src/components/ui/auth-premium-loader.tsx`
- `src/components/public/public-transition-link.tsx`

## Validación recomendada local

```bash
rm -rf node_modules .next
npm ci
npm run typecheck
npm run build
```

## Nota de validación en este entorno

No se ejecutó `typecheck` ni `build` dentro del entorno de generación porque el ZIP base no incluye `node_modules`.
