# FlowTask v3.0.0 — clean validation + board scope

## Base
Continuación directa de `flowtask_v2_from_v1_full.zip`.

## Cambios aplicados

### 1) Validación limpia / scripts
- `package.json` actualizado para ejecutar `next` y `tsc` por ruta directa dentro de `node_modules`.
- Nuevo script `ci:install` con `npm ci`.
- Nuevo script `validate:clean` para correr la secuencia recomendada:
  - `npm run clean`
  - `npm run runtime:check`
  - `npm run typecheck`
  - `npm run build`
- Nuevo archivo `scripts/validate-clean-install.mjs` para revisar que la base esté lista antes de validar.

### 2) Ajuste del board
- `src/components/dashboard/interactive-dashboard-board.tsx` ahora resuelve la organización activa desde `organization_members`.
- La carga de tareas y proyectos deja de depender solo de `owner_id`.
- El board ahora intenta leer datos por alcance de workspace:
  - personal (`owner_id = user.id`)
  - organizacional (`organization_id = activeOrganizationId OR owner_id = user.id`)
- El header del board ahora refleja si está trabajando en workspace personal u organizacional.

## Estado de validación en esta sesión
- Se dejó lista la base para validación limpia local.
- En este entorno no quedó certificada una instalación nueva de dependencias vía `npm ci`, así que la certificación final de build limpio debe correrse localmente con:

```bash
npm ci
node scripts/validate-clean-install.mjs
npm run validate:clean
```

## Objetivo de esta versión
Cerrar la parte de saneamiento operativo y avanzar el board hacia el modelo real de la BD multi-tenant.
