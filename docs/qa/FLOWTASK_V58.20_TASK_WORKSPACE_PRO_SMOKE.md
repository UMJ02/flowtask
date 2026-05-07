# FlowTask v58.20 — Task Workspace Pro Smoke QA

## Objetivo

Validar que la vista de tareas quedó lista como workspace operativo moderno sin romper Supabase, aislamiento personal/organización ni funcionalidades existentes.

## 1. CLI

```bash
npm run validate:env
npm run runtime:check
npm run doctor:supabase
npm run verify:v58.20
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```

## 2. Vista de tarea guardada

1. Ir a `/app/tasks`.
2. Abrir una tarea independiente.
3. Confirmar que aparece `Task Workspace Pro`.
4. Confirmar barra sticky con estado, prioridad, progreso y acciones.
5. Confirmar layout 70/30 con sidebar sticky.
6. Confirmar que no se muestra ID técnico al usuario.
7. Confirmar que el botón Editar lleva a la edición existente.

## 3. Checklist y progreso

1. Abrir tarea sin checklist.
2. Confirmar progreso en 0%.
3. Confirmar mensaje: `Agregá el checklist...`.
4. Agregar un item.
5. Marcar item como completado.
6. Confirmar que el progreso sube según items reales.

## 4. Comentarios, archivos y actividad

1. Agregar comentario.
2. Subir archivo si el permiso lo permite.
3. Confirmar que la bitácora rápida usa texto humano.
4. Confirmar que la sección `Actividad de la tarea` no muestra nombres backend crudos como experiencia principal.

## 5. Readonly

1. Entrar con usuario sin permiso completo.
2. Confirmar `Modo lectura activo`.
3. Confirmar que la UI permite ver información sin exponer acciones de edición no permitidas.

## 6. Aislamiento personal ↔ organización

1. En workspace personal, crear/abrir una tarea personal.
2. Cambiar a organización.
3. Confirmar que la tarea personal no aparece.
4. Crear/abrir tarea de organización.
5. Volver a personal.
6. Confirmar que la tarea de organización no aparece.

## 7. Regresión v58.19.9

- Exportar Excel real desde analítica.
- Abrir landing pública.
- Confirmar Vercel build sin error de `node_modules must not exist in release package`.
