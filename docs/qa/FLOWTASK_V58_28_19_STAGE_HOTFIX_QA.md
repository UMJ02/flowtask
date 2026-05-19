# QA — v58.28.19 Stage Hotfix

Validar:

```bash
npm run verify:current
npm run workspace:final-copy:ready
npm run workspace:doctor
npm run build:preflight
npm run vercel:build
```

Resultado esperado:

- `workspace:doctor` no debe fallar por `APP_RELEASE_STAGE`.
- `verify:current` debe pasar.
- `workspace:final-copy:ready` debe pasar.
