# v58.24.7 — Boards Home Action Alignment + Handoff Cleanup

Base: `v58.24.6 — Boards Home UI Redesign + Saved Board Delete`.
Estado: `production-candidate`.

## Objetivo

Cerrar inconsistencias de producto en `/app/boards` antes de avanzar a funciones grandes. Esta versión alinea botones, textos y estados visibles con acciones reales para que la pantalla de Pizarras no prometa funciones que todavía no existen.

## Cambios aplicados

- El botón secundario del hero ya no dice `Importar`, porque no existía un flujo real de importación.
- La acción secundaria ahora lleva al bloque de plantillas con `Ver plantillas`.
- `Ver todas las plantillas` ahora sí tiene comportamiento real: despliega/oculta la plantilla adicional disponible.
- `Ver todas mis pizarras` fue reemplazado por `Actualizar`, una acción real que recarga la lista.
- Se eliminaron los avatares simulados basados en el largo del título.
- Las cards recientes ahora muestran un badge real de acceso: `Privada`, `Compartida`, `Enlace activo` o `Enlace editable`.
- El modal de quitar pizarra ya no dice `Acción irreversible` porque la operación usa soft delete con `deleted_at`.
- Se mantiene el editor `/app/boards/[boardId]` intacto.
- Se mantienen Supabase, RLS, Storage y Realtime intactos.

## Archivos principales

- `src/components/boards/boards-home.tsx`
- `src/app/globals.css`
- `src/lib/release/version.ts`
- `scripts/verify-v58.24.7.mjs`
- `scripts/build-deploy-readiness.mjs`
- `scripts/deploy-production-readiness.mjs`
- `docs/qa/FLOWTASK_V58_24_7_BOARDS_HOME_ACTION_ALIGNMENT_QA.md`

## Validación esperada

```bash
npm install
npm run verify:v58.24.7
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```

## Criterio de cierre

La versión queda lista cuando `/app/boards` confirma que:

1. No aparece `Importar` sin función real.
2. `Ver plantillas` desplaza al bloque correcto.
3. `Ver todas las plantillas` muestra/oculta más plantillas.
4. `Actualizar` recarga pizarras recientes.
5. No hay avatares simulados.
6. Los badges de acceso corresponden al estado real de la pizarra.
7. El modal de quitar pizarra no promete eliminación irreversible.
