# v58.27.1 — Release Candidate Fixes

## Objetivo
Consolidar la línea Workspace-First como release candidate para validación final de cliente sin agregar migraciones nuevas, sin cambiar RLS y sin reemplazar rutas clásicas.

## Alcance consolidado
- Workspace full-screen en `/app/workspace`.
- Home del proyecto como vista inicial.
- Views dinámicas: Home, Lista, Board, Timeline, Tabla, Canvas, Archivos y Reportes.
- Espacios persistentes con `workspace_spaces`.
- Asignación de proyectos a espacios con `workspace_space_projects`.
- Vistas guardadas con `project_views`, incluyendo filtros, orden, agrupación y soporte para `home`.
- Members + Permissions UX.
- Empty states, migration guard y recovery panel.
- Command Center.
- Share panel y links internos.
- Performance load plan.
- Notifications + Activity Automation panel.

## Scripts nuevos
```bash
npm run workspace:release-candidate:ready
npm run verify:v58.27.1
```

## Validación recomendada
```bash
npm run workspace:doctor
npm run workspace:production:ready
npm run workspace:real-env:ready
npm run workspace:performance:ready
npm run workspace:automation:ready
npm run workspace:collaboration:ready
npm run workspace:error-recovery:ready
npm run workspace:release-candidate:ready
npm run verify:current
npm run typecheck
npm run build:preflight
npm run build
```

## Notas
Esta versión no agrega migraciones. Requiere que ya estén aplicadas 0056, 0057, 0058 y 0059 para validar el flujo Workspace completo en Supabase real.
