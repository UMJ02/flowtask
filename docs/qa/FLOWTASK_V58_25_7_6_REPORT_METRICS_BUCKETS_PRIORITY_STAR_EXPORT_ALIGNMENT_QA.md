# QA — v58.25.7.6 Report Metrics Buckets + Priority Star Export Alignment

## CLI

```bash
npm install
npm run verify:v58.25.7.6
npm run design:doctor
npm run density:guard
npm run density:guard:strict
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```

## Manual

1. Crear/usar tareas con estrella.
2. Confirmar que salen como Importantes.
3. Crear tareas sin estrella con fecha de esta semana.
4. Confirmar que salen en Semana actual.
5. Crear tareas sin estrella con fecha del mes, fuera de la semana.
6. Confirmar que salen en Mes actual.
7. Exportar Excel.
8. Confirmar que ya no aparece "Tareas del día".
9. Confirmar que aparecen Importantes, Semana actual, Mes actual, Próximas, Sin fecha y En espera.
10. Confirmar que no hay duplicados entre módulos.
