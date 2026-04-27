# FlowTask V58.15.0 Project Planning Architecture PASS

Base: V58.14.9 Analytics RealTime Intelligence PASS.

## Decisión de producto
- Tareas queda enfocada en ejecución diaria: Lista + Calendario.
- Se elimina la complejidad de Tablero/Timeline/Gantt del módulo de Tareas.
- La planificación avanzada vive en Proyectos.

## Cambios principales
- Nuevo Project Smart Timeline en detalle de proyecto.
- Builder de vista dentro de Proyectos: zoom, colores, agrupación, incluir concluidas, guardar vista y exportar CSV.
- Barras de timeline muestran avance interno con porcentaje visual.
- Proyectos sin tareas muestran empty state para crear tareas internas.
- Tarea puede escalarse a proyecto desde el detalle.
- Crear proyecto acepta `sourceTaskId` para prefills desde tarea.

## Reglas respetadas
- No se cambió `package.json`.
- No se cambió `vercel.json`.
- No se creó schema adicional.
- Se reutilizan `task_view_preferences`, `tasks`, `projects` y relaciones existentes.
