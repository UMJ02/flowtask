# V58.12.1 – Workspace Isolation Final

## Objetivo
Cerrar el aislamiento entre workspace personal y organizaciones: catálogos, board/notas por workspace y agregados del dashboard/radar.

## Cambios principales
- Catálogos de departamentos y países estrictamente filtrados por workspace.
- Persistencia del board/notas por workspace y por usuario.
- Agregados del dashboard alineados al workspace activo, tanto en personal como en organización.
- Resolución de departamentos por código endurecida con scope real.

## Validación esperada
- npm run typecheck
- npm run build:preflight
- npm run build
- npm run verify:v58.12.1
