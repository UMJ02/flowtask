# FlowTask v7.4.0 — Deploy Safe v5

## Estado validado
Esta versión toma como base la v4 que ya logró pasar exitosamente en entorno local con esta secuencia:

```bash
npm install
npm run runtime:check
npm run vercel:preflight
npm run build
```

Resultado esperado:
- runtime env OK
- typecheck OK
- next build OK
- rutas App Router generadas sin error

## Objetivo de v5
No meter cambios riesgosos de producto ahora que la base ya compila. Esta versión se enfoca en continuidad segura para deploy.

## Scripts nuevos
- `npm run security:check`
- `npm run deploy:ready`
- `npm run vercel:prod-ready`

## Secuencia recomendada
```bash
npm install
npm run security:check
npm run runtime:check
npm run vercel:preflight
npm run build
```

## Criterio operativo
- primero estabilidad y deploy seguro
- luego features
- no volver a empacar secretos ni artefactos locales en zips futuros
