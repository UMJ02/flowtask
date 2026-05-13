# QA — v58.25.7.5 Boards Create Card Red Accent + Color Cover Previews

## CLI

```bash
npm install
npm run verify:v58.25.7.5
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
2. Confirmar que `Crear nueva pizarra` tiene plus rojo.
3. Confirmar que las pizarras recientes no usan imagen fallback.
4. Confirmar que cada pizarra tiene un color.
5. Confirmar que cada pizarra mantiene color estable al refrescar.
6. Confirmar que borrar pizarra sigue usando RPC segura.
