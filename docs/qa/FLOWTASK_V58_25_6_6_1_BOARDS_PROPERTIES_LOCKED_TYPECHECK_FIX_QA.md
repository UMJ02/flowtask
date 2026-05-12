# QA — v58.25.6.6.1 Boards Properties Locked Typecheck Fix

## CLI

```bash
npm install
npm run verify:v58.25.6.6.1
npm run design:doctor
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```

## Manual

1. Abrir una pizarra.
2. Seleccionar un elemento.
3. Abrir panel de propiedades.
4. Probar toggle de bloqueo.
5. Contraer/expandir panel.
6. Confirmar que no rompe el inspector.
