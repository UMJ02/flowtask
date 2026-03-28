# FlowTask v1.5.0-automation

## Resumen
Versión enfocada en dejar más visible y operativa la capa de actividad y automatizaciones, sin abrir features de alto riesgo.

## Cambios principales

### 1. Dashboard con actividad real
- `src/lib/queries/activity.ts`
  - Se tipó `ActivityItem`.
  - Se agregó `getRecentActivitySummary()` para devolver items + conteos.
- `src/components/dashboard/recent-activity.tsx`
  - Reemplazo del contenido estático por timeline real reutilizable.
- `src/app/(app)/app/dashboard/page.tsx`
  - Integra `getRecentActivitySummary(10)` y lo pinta dentro del dashboard.

### 2. Timeline mejorado
- `src/components/activity/activity-timeline.tsx`
  - Badges visuales por tipo de entidad.
  - Lectura de metadata (`title`, `status`, `description`).
  - Soporte `compact` para reuso en dashboard.

### 3. Automation center en settings
- `src/components/settings/automation-control-center.tsx`
  - Nuevo componente con resumen visual del estado de automatizaciones.
- `src/app/(app)/app/settings/page.tsx`
  - Integra el nuevo bloque antes del formulario de preferencias.

### 4. Salud de entregas
- `src/components/notifications/notification-delivery-health.tsx`
  - Nuevo componente con KPIs de entregas y digest.
- `src/app/(app)/app/notifications/page.tsx`
  - Integra el bloque de health antes del panel live.

### 5. Documentación
- `README.md` actualizado a `v1.5.0-automation`.
- `package.json` actualizado a `1.5.0-automation`.

## Validación
- `npm run typecheck` en cero usando las dependencias del proyecto original restauradas en el entorno de validación.

## Riesgo
Bajo. Los cambios son mayormente de lectura, presentación y composición de datos ya existentes.
