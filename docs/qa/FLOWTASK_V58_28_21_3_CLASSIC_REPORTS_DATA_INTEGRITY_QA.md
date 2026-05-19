# FlowTask v58.28.21.3 — Classic Reports Data Integrity QA

## Objetivo
Validar que Analytics clásico, landing pública y exportación Excel usen la misma data enriquecida de la base.

## QA manual obligatorio
1. Crear o identificar una tarea con comentarios.
2. Confirmar que el último comentario aparece en el Excel y landing pública.
3. Crear o identificar una tarea con checklist parcial.
4. Confirmar que Excel muestra `Avance %` y `Checklist`.
5. Confirmar que landing muestra avance por tarea.
6. Validar que los estados se lean como: Pendiente, En curso, Producción, En espera, Revisión y Concluido.
7. Validar que el diseño general del Excel/landing no cambió, solo se agregaron columnas/valores.

## Validación CLI
```bash
npm run verify:current
npm run workspace:reports-data-integrity:ready
npm run build:preflight
npm run vercel:build
```
