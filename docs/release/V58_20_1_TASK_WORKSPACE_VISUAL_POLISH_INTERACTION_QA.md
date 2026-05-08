# v58.20.1 — Task Workspace Visual Polish + Interaction QA

Base: `v58.20-task-workspace-inline-redesign`.

## Objetivo

Patch quirúrgico sobre la vista `TaskWorkspaceInline` para corregir contrato Supabase, limpiar UI repetida y cerrar interacciones que parecían funcionales pero no tenían acción real.

## Cambios incluidos

- Contrato Supabase corregido: tareas solo exponen `en_proceso`, `en_espera`, `concluido`.
- Se removieron estados inválidos de tarea: `completado` y `vencida`.
- `logActivity` ahora enriquece eventos de tarea con `task_id` real y `metadata.task_id`.
- Cancelar edición restaura el snapshot original de la tarea.
- El indicador de guardado ya no dice autosave; ahora usa copy honesto de guardado manual.
- Se eliminaron acciones falsas: favorito, más opciones, chevron colapsable y agregar responsable sin flujo conectado.
- Compartir ahora copia el enlace real de la tarea al portapapeles.
- Se reemplazaron tabs falsas de Actividad/Comentarios por un Feed operativo único.
- Sidebar más limpia: no repite progreso y deja status/prioridad como controles solo en edición.

## QA esperado

```bash
npm run verify:v58.20.1
npm run typecheck
npm run build:preflight
npm run build
```

## Nota

Esta versión no cambia migraciones ni arquitectura. El alcance es cerrar riesgos de UI/contrato antes de avanzar hacia una futura unificación completa de crear/editar tarea.
