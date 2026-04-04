# V58.4 — Build & Deploy Readiness

## Alcance
- dejar una validación explícita para build y deploy técnico
- alinear scripts y metadata con la línea viva `V58.4`
- fijar referencia operativa de Node para reinstalación y despliegue
- endurecer el flujo previo a build sin tocar la lógica principal del sistema

## Cambios principales
- se agrega `scripts/verify-v58.4.mjs`
- se agrega `scripts/build-deploy-readiness.mjs`
- `verify:current` y `release:repo:current` quedan alineados con `v58.4`
- se agrega `.nvmrc` con la versión de referencia de Node
- `vercel.json` usa `npm run vercel:build`
- metadata de release actualizada a `58.4-build-deploy-readiness`
- documentación operativa actualizada a V58.4

## Resultado esperado
1. La base conserva la estructura limpia de V58.3.
2. El repo deja explícitos los checks previos a build y deploy.
3. El entorno de Node recomendado queda documentado dentro del proyecto.
4. La configuración de despliegue queda más coherente para Vercel y validación manual.
