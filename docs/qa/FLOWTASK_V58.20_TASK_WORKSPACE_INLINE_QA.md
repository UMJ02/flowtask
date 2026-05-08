# QA — v58.20 Task Workspace Inline

## Validar en navegador
- Abrir `/app/tasks/[id]`.
- Confirmar que no aparece la vista anterior con tabs pesadas.
- Confirmar que el botón Editar cambia a modo inline dentro de la misma vista.
- Confirmar que `/app/tasks/[id]/edit` redirige a `/app/tasks/[id]?mode=edit`.
- Editar título, descripción, estado, prioridad, cliente o deadline y guardar.
- Confirmar que el checklist inicia en 0% si está vacío.
- Agregar checklist y marcar completado para verificar progreso real.
- Confirmar Feed Operativo: comentarios + actividad humana.
- Confirmar sidebar simple: información, responsables, fechas, adjuntos.

## Aislamiento personal ↔ organización
- Crear tarea en workspace personal y confirmar que no aparece en organización.
- Crear tarea en organización y confirmar que no aparece en personal.

## Supabase live smoke
```bash
npm run doctor:supabase
```
