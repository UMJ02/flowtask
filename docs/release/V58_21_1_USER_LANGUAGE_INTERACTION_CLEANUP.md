# v58.21.1 — User Language + Interaction Cleanup

Base: v58.21.0 Create Flow Refresh + Project Inline Activation
Stage: production-candidate

## Objetivo
Pulir la experiencia para usuario final sin agregar columnas, migraciones ni cambios de contrato Supabase.

## Cambios principales
- Se reescribieron textos técnicos en creación de tareas y proyectos.
- Se normalizó el lenguaje de usuario: fecha límite, avance, espacio de trabajo, detalle de la tarea/proyecto.
- Se eliminaron etiquetas engañosas en proyectos, incluyendo prioridad fija sin respaldo real.
- Se simplificaron tabs del detalle de proyecto para evitar duplicados y términos técnicos.
- El editor inline de proyectos ahora usa lenguaje más humano: “Editando proyecto” y “Sin salir de esta vista”.
- Los errores comunes ahora explican cómo recuperarse.
- Los campos decorativos siguen sin persistirse: no se agregan columnas nuevas.

## Contrato protegido
- No cambia RLS.
- No cambia Supabase schema.
- No cambia payload de creación/edición.
- No cambia estructura operativa de ProjectDetailPro.
- Conserva inline edit en proyectos.
- Conserva refresh visual de /app/tasks/new y /app/projects/new.

## QA sugerido
1. Crear una tarea desde `/app/tasks/new`.
2. Crear un proyecto desde `/app/projects/new`.
3. Abrir `/app/projects/[id]` y confirmar que no aparece prioridad falsa.
4. Abrir `/app/projects/[id]?mode=edit` y guardar cambios inline.
5. Confirmar que `/app/projects/[id]/edit` redirige a `?mode=edit`.
6. Revisar que los textos se entiendan sin lenguaje técnico.
