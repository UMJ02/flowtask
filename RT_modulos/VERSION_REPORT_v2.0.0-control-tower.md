# VERSION REPORT — v2.0.0-control-tower

## Resumen
Esta versión agrega una capa nueva de control operativo para complementar planning y reportes. La intención es que el usuario tenga una vista central con foco inmediato, señales por cliente y recomendaciones accionables.

## Cambios principales
- nueva consulta: `src/lib/queries/control-tower.ts`
- nuevo componente: `src/components/control-tower/control-tower.tsx`
- nueva ruta: `src/app/(app)/app/control-tower/page.tsx`
- widget compacto agregado al dashboard
- navegación principal actualizada
- command palette actualizado
- reportes actualizados con salida `type=control`
- `package.json` actualizado a `2.0.0-control-tower`
- `README.md` actualizado

## Entregables funcionales
- `/app/control-tower`
- acceso desde sidebar y mobile nav mediante `appNavLinks`
- acceso rápido desde command palette
- exportable desde `/app/reports/print?type=control`

## Nota de validación
El ZIP quedó limpio y estable para descarga. En este entorno no quedó revalidado `npm run typecheck`, por lo que esta entrega se marca como empaquetada y revisada estructuralmente, no como typecheck reconfirmado dentro del contenedor.
