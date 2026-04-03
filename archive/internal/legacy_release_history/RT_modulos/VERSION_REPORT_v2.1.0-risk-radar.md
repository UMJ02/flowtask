# VERSION REPORT — v2.1.0-risk-radar

## Resumen
Esta versión agrega una nueva capa de lectura de riesgo operativo sobre la base de control tower. La intención es detectar antes los vencimientos, la presión por cliente y los departamentos con mayor exposición.

## Cambios principales
- nueva consulta: `src/lib/queries/risk-radar.ts`
- nuevo componente: `src/components/risk/risk-radar.tsx`
- nueva ruta: `src/app/(app)/app/risk-radar/page.tsx`
- widget compacto agregado al dashboard
- navegación principal actualizada
- command palette actualizado
- reportes actualizados con salida `type=risk`
- `package.json` actualizado a `2.1.0-risk-radar`
- `README.md` actualizado
- corrección del `reports/print/page.tsx` que venía con error de sintaxis heredado

## Entregables funcionales
- `/app/risk-radar`
- acceso desde sidebar y mobile nav mediante `appNavLinks`
- acceso rápido desde command palette
- exportable desde `/app/reports/print?type=risk`

## Validación
- `npm run typecheck` validado en cero
- ZIP limpio para descarga
