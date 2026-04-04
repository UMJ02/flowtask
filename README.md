# FlowTask — V58.10 Organization UI Polish

Esta versión toma como base **V58.9** y pule la experiencia visual de la pantalla de **Equipo** sin alterar la lógica de permisos ni la arquitectura del proyecto.

## Objetivo
- reforzar la jerarquía visual del modo activo y permisos
- hacer más clara la lectura de acceso efectivo
- dejar el bloque de crear equipo con mejor balance visual
- mantener la continuidad 1:1 sin romper flujo funcional

## Qué cambia en la V58.10
- metadata y scripts alineados a `V58.10`
- nuevo `scripts/verify-v58.10.mjs`
- nuevo release doc `docs/release/V58_10_ORGANIZATION_UI_POLISH.md`
- cintillo de estado de acceso más sólido y con fallback si faltan `ck.png`/`dn.png`
- botón y despliegue de permisos refinados
- permisos en chips compactos listos para una sola línea en desktop
- formulario de creación de equipo con labels alineados y mejor proporción visual

## Scripts principales
- `npm run verify:v58.10`
- `npm run verify:current`
- `npm run release:repo:current`

## Base de continuidad
Usa esta **V58.10** como base para seguir con ajustes UX/UI del workspace o cierre visual final de producto.
