# FlowTask v5.9.1-core-hardening

Base: `v5.9.0-module-consolidation`

## Objetivo
Endurecer la capa core del producto para que las vistas principales se lean mejor, tengan más contexto desde el primer scroll y preparen una evolución más sólida en siguientes versiones.

## Cambios aplicados
- Se agregaron `src/components/core/core-metric-strip.tsx` y `src/components/core/core-route-deck.tsx` como piezas reutilizables del core.
- `src/app/(app)/app/projects/page.tsx` ahora abre con un resumen rápido de portafolio: activos, presión por fecha, proyectos colaborativos y elementos sin cliente.
- `src/app/(app)/app/tasks/page.tsx` ahora abre con un resumen de carga: abiertas, vencidas, para hoy y vinculadas a cliente.
- `src/app/(app)/app/clients/page.tsx` ahora abre con una lectura rápida por cuenta: clientes activos, con carga, con vencidas y limpios.
- `src/app/(app)/app/workspace/page.tsx` incorpora una cubierta de navegación hacia los módulos principales del core.
- `src/app/(app)/app/intelligence/page.tsx` ahora aterriza sus señales directamente sobre workspace, proyectos, tareas y clientes.
- Se actualizó `README.md`, `package.json` y `package-lock.json` al nuevo versionado.

## Archivos tocados
- `src/components/core/core-metric-strip.tsx`
- `src/components/core/core-route-deck.tsx`
- `src/app/(app)/app/projects/page.tsx`
- `src/app/(app)/app/tasks/page.tsx`
- `src/app/(app)/app/clients/page.tsx`
- `src/app/(app)/app/workspace/page.tsx`
- `src/app/(app)/app/intelligence/page.tsx`
- `package.json`
- `package-lock.json`
- `README.md`
- `V_Report/VERSION_REPORT_v5.9.1-core-hardening.md`

## Validación honesta
- La base anterior se preservó y no se tocaron rutas sensibles ni lógica de detalle.
- Se pudo correr `tsc --noEmit`, pero el proyecto sigue presentando ruido global ajeno a esta iteración por dependencias faltantes y errores previos en otras áreas del repo.
- Dentro del alcance de esta versión, los cambios se mantuvieron concentrados en la capa core y en componentes reutilizables de presentación.

## Resultado
Esta versión no mete features nuevas: fortalece la lectura del producto, baja fricción entre módulos principales y deja una base más pro para la siguiente fase funcional.
