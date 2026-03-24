# FlowTask v5.8.1-navigation-hardening

Base validada sobre `v5.7.2-health`.

## Objetivo
Ordenar la arquitectura visible del producto antes de seguir creciendo, manteniendo la base estable y evitando parches.

## Enfoque
- Workspace como home operativo real
- Intelligence como hub consolidado de planning, risk y execution
- Navegación separada entre core del producto y capa de organización
- Tipado de rutas internas para endurecer refactors y navegación

## Scripts
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run typecheck`

## Cambios clave
- `AppRoute` deja de ser `any` y pasa a tipado real de rutas internas
- Sidebar y mobile nav quedan agrupados por core y organización
- Intelligence evoluciona a hub foundation con accesos directos a Planning, Risk, Execution y salida ejecutiva
- Se mantiene la compatibilidad con la base anterior sin romper el flujo principal
