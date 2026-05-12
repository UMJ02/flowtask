# v58.25.5.1 — Records Metric Text Overflow Fix

**Base:** v58.25.5 — Records Spacing + Compact Metrics

## Fix aplicado

- `MetricCard` ahora usa `grid-cols-[36px_minmax(0,1fr)]`.
- El label usa `whitespace-normal`, `break-words`, `leading-[1.15]` y tracking reducido.
- Esto evita que `DEPARTAMENTOS` y otros labels se corten o se desborden.
