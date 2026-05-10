# v58.24.8.1 — Boards Hero Asset Integration + Template Preview Cleanup

**Base:** v58.24.8 — Boards Hero Diagram Visual Refresh

## Objetivo
Corregir la integración visual del hero de `/app/boards` usando los assets reales suministrados por el usuario y limpiar las previews de plantillas para que se vean más consistentes y menos “dibujadas por CSS”.

## Alcance
- Integrar `hero.png` en el hero de Boards Home.
- Integrar los iconos reales de toolbar.
- Integrar assets reales en las previews de plantillas.
- Mantener el layout general del hero, copy y CTA.
- No tocar el editor de la pizarra.
- No tocar Supabase, RLS, Realtime, Storage ni migraciones.

## Archivos tocados
- `src/components/boards/boards-home.tsx`
- `src/app/globals.css`
- `public/boards-home/*`
- `src/lib/release/version.ts`
- `package.json`
- `package-lock.json`
- `scripts/verify-v58.24.8.1.mjs`
- `docs/release/V58_24_8_1_BOARDS_HERO_ASSET_INTEGRATION_TEMPLATE_PREVIEW_CLEANUP.md`
- `docs/qa/FLOWTASK_V58_24_8_1_BOARDS_HERO_ASSET_INTEGRATION_TEMPLATE_PREVIEW_CLEANUP_QA.md`

## Validación
```bash
npm run verify:v58.24.8.1
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
