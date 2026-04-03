# FlowTask v7.5.2-board-flow-compact-v6.2

## Cambios aplicados
- Se eliminó el panel/hero “Mueve trabajo sin perder contexto” dentro de Pizarra.
- El flujo en pizarra ahora renderiza solo las tres columnas sin el bloque superior.
- Se simplificaron los títulos de columna, con tamaño menor y sin descripciones.
- Se removieron descripciones innecesarias de los botones laterales de paneles.
- Las tarjetas de tareas del flujo se compactaron: solo título, fecha y acciones.
- El icono de arrastre quedó al lado izquierdo de la tarjeta.
- Se limitaron a 5 tareas visibles por columna, priorizando las fechas más próximas.
- Se reforzó el drag and drop enviando `text/task-id` y `text/plain` en el arrastre.

## Objetivo
Hacer que el flujo dentro de Pizarra ocupe menos espacio vertical, se vea más limpio y se comporte mejor cuando existan varias tareas.
