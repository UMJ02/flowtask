# QA — v58.28.19 UX Copy + Empty States Final

Validar en `/app/workspace`:

- Home sin tareas importantes.
- Home sin próximos vencimientos.
- Home sin proyectos activos.
- Lista vacía.
- Proyectos vacíos.
- Board vacío.
- Timeline sin fechas.
- Tabla vacía.
- Canvas sin pizarras.
- Archivos sin archivos.
- Reportes con selector “Todo el trabajo”.
- Panel derecho sin actividad y sin vencimientos.

Comandos:

```bash
npm install
npm audit --audit-level=moderate
npm run verify:current
npm run workspace:final-copy:ready
npm run build:preflight
npm run vercel:build
npm run dev
```
