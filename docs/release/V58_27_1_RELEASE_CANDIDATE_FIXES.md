# FlowTask v58.27.1 — Release Candidate Fixes

Patch de estabilización sobre v58.27.0 Client Final Release Candidate.

## Objetivo

Cerrar detalles de release candidate sin agregar módulos nuevos ni tocar RLS/migraciones.

## Incluye

- Versionado alineado a `58.27.1-release-candidate-fixes`.
- `verify:current` apuntando a `verify:v58.27.1`.
- Nuevo check `workspace:rc-fixes:ready`.
- `build:preflight` reforzado con el check de RC fixes.
- Documentación QA y checklist actualizados.
- Corrección de mensajes de readiness heredados que podían referirse a versiones anteriores.

## No incluye

- Nuevas migraciones.
- Cambios de RLS.
- Reemplazo de rutas clásicas.
- Nuevas dependencias.

## Validación esperada

```bash
npm run workspace:doctor
npm run workspace:production:ready
npm run workspace:real-env:ready
npm run workspace:performance:ready
npm run workspace:automation:ready
npm run workspace:collaboration:ready
npm run workspace:error-recovery:ready
npm run workspace:release-candidate:ready
npm run workspace:rc-fixes:ready
npm run verify:current
npm run typecheck
npm run build:preflight
npm run build
```
