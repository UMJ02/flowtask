# V58.17 Core Consolidation Release

Base: V58.16.4 Project Timeline Full Width Polish.

## Objetivo
Consolidar el core antes de seguir agregando features: Tareas simples y Proyectos quedan separados de forma clara, sin romper Supabase ni las conexiones actuales.

## Cambios clave
- El módulo Tareas se mantiene como espacio de tareas simples independientes.
- La ruta de nueva tarea ignora `projectId` por querystring para evitar crear tareas de proyecto desde el módulo Tareas.
- Si una tarea con `project_id` se abre manualmente desde `/app/tasks/[id]`, se redirige a su Proyecto padre.
- Si una tarea con `project_id` se intenta editar desde `/app/tasks/[id]/edit`, se redirige a su Proyecto padre.
- Las tareas internas de proyecto siguen viviendo en `ProjectInlineTasks`, creadas inline con `project_id = project.id`.
- El timeline conserva el polish de V58.16.4: Builder oculto por defecto y ancho completo cuando está cerrado.
- Textos del módulo Tareas aclarados para explicar la diferencia entre tareas simples y tareas internas de proyecto.

## DB
No requiere migración nueva. Mantiene la migración previa:
- `projects.image_url`
- `clients.avatar_url`

## Verificación
- `npm run verify:v58.17`
- `npm run deploy:readiness`
- `npm run deploy:production:ready`
