# FlowTask v5.9.0-module-consolidation

Base validada sobre `v5.8.1-navigation-hardening`.

## Objetivo
Consolidar los módulos operativos relacionados con intelligence sin romper compatibilidad, definiendo qué queda como core, qué queda como soporte y qué se conserva como legacy.

## Enfoque
- Intelligence Hub como punto oficial de entrada para la capa analítica
- Planning, Risk Radar y Execution Center como módulos core
- Control Tower y Executive Suite como módulos de soporte
- Workspace Intelligence y Workspace OS preservados como legacy con señal clara de migración

## Scripts
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run typecheck`

## Cambios clave
- Se crea un registro central de módulos de intelligence para ordenar lifecycle, CTAs y salidas PDF
- Intelligence Hub muestra el mapa oficial de módulos core, soporte y legacy
- Las vistas heredadas y complementarias incorporan banner de consolidación para orientar al usuario sin romper rutas previas
- La command palette y los enlaces internos apuntan al nuevo flujo consolidado
