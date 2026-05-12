# QA — v58.25.6.3 Dashboard + Analytics UI System Migration

## 1. Dashboard

1. Abrir `/app/dashboard`.
2. Confirmar hero más compacto.
3. Confirmar métricas compactas.
4. Confirmar botones alineados.
5. Confirmar que no hay cards enormes ni elementos pegados.

## 2. Workspace board / dashboard interactivo

1. Revisar cards internas.
2. Revisar filas.
3. Confirmar que no hay hover lift raro.
4. Confirmar que acciones siguen funcionando.

## 3. Analytics

1. Abrir `/app/analytics`.
2. Confirmar KPIs compactos.
3. Confirmar gráficos dentro de paneles limpios.
4. Probar cambio de rango 7/30 días.
5. Probar exportar CSV / compartir.

## 4. Reports

1. Abrir `/app/reports`.
2. Confirmar paneles de reporte limpios.
3. Confirmar filas y métricas sin desbordes.
4. Probar imprimir/compartir si aplica.

## 5. CLI

```bash
npm install
npm run verify:v58.25.6.3
npm run design:doctor
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
