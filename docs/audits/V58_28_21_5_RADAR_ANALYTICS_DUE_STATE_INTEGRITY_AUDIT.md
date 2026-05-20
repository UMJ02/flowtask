# v58.28.21.5 — Radar + Analytics Due State Integrity

Base validada: v58.28.21.4 — Share Landing Short Link + Stored Report Tokens.

## Regla oficial

- `pendiente`, `en_proceso`, `produccion`: sí pueden vencer por `due_date`.
- `en_espera`, `revision`: no son vencidas; generan seguimiento si llevan 5+ días sin movimiento.
- `concluido`: no participa en radar activo ni alertas; solo vuelve si cambia de estado.

## Correcciones

- Centralización de elegibilidad de vencimiento en `src/lib/tasks/status.ts`.
- Exclusión de `revision` en filtros `due=overdue`, `due=today`, `due=soon`.
- Radar principal separa vencimiento real de seguimiento por espera/revisión.
- Planning y control tower calculan vencimientos solo desde tareas gestionables por fecha.
- Dashboard evita contar tareas en revisión como vencidas.

## Check agregado

`npm run workspace:radar-data-integrity:ready`
