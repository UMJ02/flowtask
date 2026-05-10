# FlowTask — v58.24.8 Boards Hero Diagram Visual Refresh

Base: **v58.24.7 — Boards Home Action Alignment + Handoff Cleanup**

## Cambios clave v58.24.8

- Se mantiene la estructura del hero en `/app/boards`.
- Se mantiene el copy principal, el subtítulo y los CTA.
- Se reemplaza la ilustración decorativa del hero por una composición visual tipo diagrama, más clara y más alineada con la promesa de Pizarras Visuales.
- No se tocan Supabase, RLS, Realtime, Storage ni el editor `/app/boards/[boardId]`.
- `verify:current` apunta a `verify:v58.24.8`.

## Validación recomendada

```bash
npm install
npm run verify:v58.24.8
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
