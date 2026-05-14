# FlowTask v58.26.2 — Workspace Performance QA

## Checklist funcional

1. Abrir `/app/workspace?view=list` y validar que Lista carga tareas sin pedir reportes/pizarras/archivos/actividad innecesarios.
2. Abrir `/app/workspace?view=board` y validar que Board carga rápido con tareas reales.
3. Abrir `/app/workspace?view=timeline` y validar que solo usa tareas con fechas.
4. Abrir `/app/workspace?view=table` y validar edición inline de tareas.
5. Abrir `/app/workspace?view=home` y validar que sí carga resumen completo: reportes, pizarras, archivos y actividad.
6. Abrir `/app/workspace?view=canvas` y validar que carga pizarras reales.
7. Abrir `/app/workspace?view=files` y validar que carga archivos y pizarras conectadas.
8. Abrir `/app/workspace?view=reports` y validar que carga `getReportsOverview`.
9. Probar con `projectId` activo y confirmar que pizarras/archivos se reducen al proyecto.
10. Probar Command Center en vistas ligeras; debe buscar lo disponible sin romper.

## Checklist técnico

```bash
npm run workspace:performance:ready
npm run workspace:doctor
npm run workspace:production:ready
npm run workspace:real-env:ready
npm run verify:current
npm run typecheck
npm run build:preflight
npm run build
```

## Riesgos a vigilar

- En vistas ligeras, el Command Center puede mostrar menos recursos secundarios hasta cambiar a Home/Files/Canvas.
- En Home se mantiene carga completa porque es la vista resumen.
- En reportes se carga analytics solo cuando la vista activa lo requiere.
