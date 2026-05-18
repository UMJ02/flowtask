# QA — v58.28.8 Workspace Pro Client Performance + Anchored Popovers

## CLI
- npm run verify:current
- npm run workspace:client-performance:ready
- npm run workspace:performance-pass:ready
- npm run build:preflight
- npm run vercel:build

## Navegador
- Cambiar entre Home, Tareas, Board, Timeline, Tabla, Canvas, Archivos y Reportes.
- Validar que el cintillo de cambio de vista sea rápido y no tape contenido.
- En Board, abrir `...` en varias tarjetas y confirmar que el popover aparece junto al item.
- Cambiar estado desde el popover y confirmar que la tarea se mueve de inmediato.
- Cambiar prioridad desde el popover y confirmar que actualiza sin refresco pesado.
- Validar drag/drop entre columnas.
- Validar que el Board no se sienta bloqueado después de editar.
