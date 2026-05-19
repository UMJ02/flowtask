# Audit — v58.28.21.3 Classic Reports Data Integrity

## Hallazgos corregidos
- Antes, el último comentario solo se resolvía para tareas en espera.
- Ahora, los comentarios se consultan por lote para todas las tareas exportables.
- Antes, Excel y landing no mostraban avance por checklist.
- Ahora se incluye avance porcentual y relación completados/total.
- Antes, los estados del reporte podían usar etiquetas viejas.
- Ahora se usan etiquetas finales: Pendiente, En curso, Producción, En espera, Revisión, Concluido.

## Checks agregados
- `verify:v58.28.21.3`
- `workspace:reports-data-integrity:ready`
