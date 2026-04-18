# FlowTask — V58.12 Workspace Isolation Hardening Pro Level

## Qué cambia en la V58.12
- versión y metadata alineadas a `V58.12`
- endurecimiento de aislamiento entre workspace personal y organizaciones
- fallback automático a personal cuando una organización queda eliminada
- selección activa más estricta para no mezclar catálogos personales y organizacionales
- nuevo `scripts/verify-v58.12.mjs`
- nuevo release doc `docs/release/V58_12_WORKSPACE_ISOLATION_HARDENING_PRO_LEVEL.md`

## Verificación rápida
- `npm run verify:v58.12`
- `npm run typecheck`
- `npm run build:preflight`

Usa esta **V58.12** como base oficial para seguir operando FlowTask con workspaces realmente aislados entre personal y organizaciones múltiples.
