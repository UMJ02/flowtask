# Flowtask v58.19.6 — Analytics Share Build Fix

Base: v58.19.5 Analytics Share + Smart Export

## Corrección aplicada

- Corrige el error de TypeScript en `src/components/shared/shared-analytics-landing.tsx` donde `payload.workspaceName` era leído dentro de `handleShare()` y el compilador lo marcaba como posiblemente `null`.
- Se creó una constante segura `shareTitle` después de la validación `if (!payload) return`, manteniendo intacta la lógica visual y funcional del landing público.

## Alcance

- No cambia diseño.
- No cambia exportación inteligente.
- No cambia Analítica.
- No cambia auth, workspace, loaders ni rutas.

## Validación recomendada

```bash
rm -rf node_modules .next tsconfig.tsbuildinfo
npm install
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
