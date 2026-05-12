# QA — v58.21.0 Create Flow Refresh + Project Inline Activation

1. Crear una tarea desde `/app/tasks/new` y confirmar que conserva título, descripción, estado, prioridad, responsable visual, departamento, registro, país y deadline.
2. Crear un proyecto desde `/app/projects/new` y confirmar imagen opcional, estado, departamento, registro, país, deadline y colaborativo.
3. Abrir `/app/projects/[id]`, tocar editar y confirmar que la URL queda en `?mode=edit`.
4. Editar inline nombre, descripción, estado, departamento, registro, país, deadline y colaborativo.
5. Guardar y confirmar que vuelve al detalle sin perder stats, tabs, timeline, tareas internas, actividad, miembros ni archivos.
6. Confirmar que `/app/projects/[id]/edit` redirige al modo inline.
