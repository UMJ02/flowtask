# QA — v58.25.7.3.1 Boards Readiness Alignment Fix

## CLI

```bash
npm install
npm run verify:v58.25.7.3.1
npm run design:doctor
npm run density:guard
npm run density:guard:strict
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```

## Manual

1. Abrir `/app/boards`.
2. Confirmar que el hero no muestra imagen grande.
3. Confirmar que las plantillas muestran assets de `public/boards-home`.
4. Confirmar que crear nueva pizarra usa `nuevo_proyecto.png`.
