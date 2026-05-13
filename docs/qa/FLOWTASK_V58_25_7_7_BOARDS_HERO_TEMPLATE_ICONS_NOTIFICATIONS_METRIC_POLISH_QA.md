# QA — v58.25.7.7 Boards Hero + Template Icons + Notifications Metric Polish

## CLI

```bash
npm install
npm run verify:v58.25.7.7
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
2. Confirmar hero compacto: texto izquierda, botones derecha.
3. Confirmar que el hero no muestra ilustración grande.
4. Confirmar que la fila de plantillas mantiene assets de `public/boards-home`.
5. Confirmar que `Crear nueva pizarra` tiene plus rojo en área visual.
6. Confirmar que las pizarras recientes usan covers de colores.
7. Abrir Notificaciones.
8. Confirmar que los cards de métricas son anchos y no desbordan.
