# QA — v58.28.15 Workspace Pro Deep Component Extraction + Lazy View Loading

## CLI

- `npm run verify:current`
- `npm run workspace:component-split:ready`
- `npm run workspace:deep-component:ready`
- `npm run build:preflight`
- `npm run vercel:build`

## Navegador

Validar `/app/workspace`:

- Home carga sin skeletons ni cintillo de actualización.
- Tareas, Board, Timeline, Tabla cambian sin recarga pesada.
- Quick Create abre correctamente.
- Espacios abre correctamente.
- Vistas guardadas abre correctamente.
- Command Center abre correctamente.
- Share Panel abre correctamente.
- Recovery Panel se muestra solo cuando corresponde.
- Archivos mantiene upload entry funcional.

