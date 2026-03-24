# FlowTask v5.9.0-module-consolidation

Base: `v5.8.1-navigation-hardening`

## Objetivo
Consolidar la familia de módulos de intelligence para que el producto deje de sentirse disperso, sin eliminar rutas existentes ni romper compatibilidad con la base anterior.

## Cambios aplicados
- Se agregó `src/lib/intelligence/module-registry.ts` como fuente central para definir módulos core, soporte y legacy.
- Se agregaron componentes reutilizables de consolidación (`ModuleMap` y `ModuleConsolidationBanner`) para comunicar claramente el rol actual de cada módulo.
- `src/app/(app)/app/intelligence/page.tsx` deja de presentar tarjetas aisladas y pasa a mostrar el mapa oficial de módulos por lifecycle.
- `workspace-intelligence`, `workspace-os`, `control-tower` y `executive-suite` ahora muestran un banner de consolidación que redirige hacia el hub principal sin quitar la pantalla existente.
- Se reforzaron helpers de navegación para planning, risk radar, execution center, control tower, executive suite y vistas legacy.
- La command palette suma accesos explícitos a planning, risk radar, execution center y control tower, pero mantiene como entrada principal el Intelligence Hub.
- Se actualizaron copys internos para empujar el flujo consolidado en vez de seguir promoviendo rutas heredadas.

## Archivos tocados
- `src/lib/intelligence/module-registry.ts`
- `src/components/intelligence/module-consolidation-banner.tsx`
- `src/components/intelligence/module-map.tsx`
- `src/lib/navigation/routes.ts`
- `src/components/layout/command-palette.tsx`
- `src/app/(app)/app/intelligence/page.tsx`
- `src/app/(app)/app/workspace-intelligence/page.tsx`
- `src/app/(app)/app/workspace-os/page.tsx`
- `src/app/(app)/app/control-tower/page.tsx`
- `src/app/(app)/app/executive-suite/page.tsx`
- `src/app/(app)/app/workspace/page.tsx`
- `src/components/intelligence/workspace-intelligence.tsx`
- `src/components/os/workspace-operating-system.tsx`
- `src/components/execution/execution-center.tsx`
- `src/components/executive/executive-suite.tsx`
- `package.json`
- `package-lock.json`
- `README.md`
- `V_Report/VERSION_REPORT_v5.9.0-module-consolidation.md`

## Validación honesta
- Se trabajó sobre la base anterior completa, manteniendo compatibilidad de rutas.
- En este entorno no quedó certificada una corrida completa de `npm run typecheck` ni `npm run build` porque el proyecto sigue sin dependencias instaladas en el contenedor de trabajo.
- La consolidación se hizo sin remover módulos ni cambiar consultas sensibles, para no introducir regresiones innecesarias.

## Resultado
Esta versión ordena la capa de intelligence a nivel producto: deja un punto de entrada claro, baja la sensación de duplicidad y preserva compatibilidad mientras se prepara la siguiente etapa de hardening funcional.
