# QA — v58.28.13 Workspace Pro Final Cleanup Audit

## CLI obligatorio

```bash
npm install
npm run verify:current
npm run workspace:final-cleanup:ready
npm run build:preflight
npm run vercel:build
npm run dev
```

## QA visual

Validar:

- `/app/workspace?view=home`
- `/app/workspace?view=tasks`
- `/app/workspace?view=projects`
- `/app/workspace?view=board`
- `/app/workspace?view=timeline`
- `/app/workspace?view=table`
- `/app/workspace?view=canvas`
- `/app/workspace?view=files`
- `/app/workspace?view=reports`

## Resultado esperado

- El build no depende de verificadores históricos.
- El Workspace Pro conserva la UI de v58.28.12.
- No se reintroducen skeletons ni cintillos de carga.
- Board mantiene popover portal, estados y colores.
- Home conserva hero y colores sólidos.
