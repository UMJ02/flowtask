# FlowTask — v58.24.8.1 Boards Hero Asset Integration + Template Preview Cleanup

Base: **v58.24.8 — Boards Hero Diagram Visual Refresh**

## Cambios clave v58.24.8.1

- Se integra `hero.png` como visual principal del hero en `/app/boards`.
- Se integran los assets reales de toolbar (`icon-flecha`, `icon-frame`, `icon-text`, `icon-puntos`).
- Se limpian las previews de plantillas para usar assets reales por plantilla.
- La plantilla `Reunión con cliente` usa una preview wide basada en `hero.png` como fallback visual controlado.
- No se tocan Supabase, RLS, Realtime, Storage ni el editor `/app/boards/[boardId]`.
- `verify:current` apunta a `verify:v58.24.8.1`.

## Assets integrados

- `public/boards-home/hero.png`
- `public/boards-home/diagrama_fujo.png`
- `public/boards-home/plan_proyecto.png`
- `public/boards-home/mapa_ideas.png`
- `public/boards-home/pizarra_blanco.png`
- `public/boards-home/wireframe.png`
- `public/boards-home/icon-flecha.png`
- `public/boards-home/icon-frame.png`
- `public/boards-home/icon-text.png`
- `public/boards-home/icon-puntos.png`

## Validación recomendada

```bash
npm install
npm run verify:v58.24.8.1
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
