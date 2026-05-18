# Auditoría — v58.28.18 Dependency Security Audit

## Problema original
`npm audit` reportaba 5 vulnerabilidades:
- `brace-expansion` — moderate.
- `next` — high.
- `picomatch` — high.
- `postcss` — moderate.
- `ws` — moderate.

## Solución aplicada
Se aplicó un patch seguro sin `--force`:
- `next`: 15.5.18.
- `postcss`: 8.5.14 mediante override para `next@15.5.18`.
- `brace-expansion`: 5.0.6 mediante override.
- `picomatch`: 4.0.4 mediante override.
- `ws`: 8.20.1 mediante override.

## Resultado
`npm audit --audit-level=moderate` retorna 0 vulnerabilidades.

## Riesgos controlados
- No se usó `--force`.
- No se saltó a Next 16.
- No se modificó UI ni lógica de datos.
- Se mantiene React 19.0.0.
