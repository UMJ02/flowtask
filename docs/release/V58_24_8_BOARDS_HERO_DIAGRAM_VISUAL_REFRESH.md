# v58.24.8 — Boards Hero Diagram Visual Refresh

**Base:** v58.24.7 — Boards Home Action Alignment + Handoff Cleanup

## Objetivo
Actualizar la ilustración decorativa del hero en `/app/boards` para que se vea más premium, más clara y más conectada con la idea de diagramación visual.

## Alcance
- Mantener el layout general del hero.
- Mantener el copy del lado izquierdo.
- Mantener los CTA.
- Reemplazar únicamente el visual decorativo del lado derecho.
- No tocar el editor de la pizarra.
- No tocar Supabase, RLS, Realtime ni migraciones.

## Archivos tocados
- `src/components/boards/boards-home.tsx`
- `src/app/globals.css`
- `src/lib/release/version.ts`
- `package.json`
- `package-lock.json`
- `scripts/verify-v58.24.8.mjs`
- `docs/release/V58_24_8_BOARDS_HERO_DIAGRAM_VISUAL_REFRESH.md`
- `docs/qa/FLOWTASK_V58_24_8_BOARDS_HERO_DIAGRAM_VISUAL_REFRESH_QA.md`

## Validación
```bash
npm run verify:v58.24.8
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
