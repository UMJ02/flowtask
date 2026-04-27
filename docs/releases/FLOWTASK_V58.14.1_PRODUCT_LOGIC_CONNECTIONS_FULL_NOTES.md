# FlowTask V58.14.1 Product Logic Connections FULL

Base usada: V58.14 Analytics Charts Premium.

## Objetivo
Primera pasada de saneamiento funcional para reducir botones muertos y conectar flujos de uso reales antes de seguir con rediseños visuales.

## Cambios aplicados

### Proyectos /app/projects
- Botón Filtros ahora apunta al bloque real de filtros.
- Filtros de estado, modo, departamento y cliente dejaron de ser links vacíos y ahora son controles reales dentro de un formulario GET.
- Botón Aplicar ejecuta filtros usando la lógica existente de getProjects.
- Botón Limpiar vuelve a /app/projects.
- Acciones de tabla ahora separan Ver y Editar proyecto.
- Paginación visual falsa fue reemplazada por estado informativo real para evitar interacción engañosa.

### Detalle de proyecto
- Botón Compartir ahora copia la URL actual al portapapeles con feedback.
- Botón Más opciones fue renombrado a Editar proyecto porque su acción real es abrir el editor.

### Tareas /app/tasks
- Checkboxes de fila ahora tienen estado real de selección.
- Checkbox maestro selecciona/deselecciona las tareas visibles.
- Barra de acciones masivas real:
  - Finalizar seleccionadas.
  - Eliminar seleccionadas.
  - Limpiar selección.
- Botón eliminar ahora usa icono de basura en vez de menú de tres puntos.
- Vista Calendario deja de ser placeholder y agrupa tareas reales por fecha límite.
- Vista Gantt deja de ser placeholder y muestra una línea visual conectada a tareas reales, prioridad y estado.

### Crear / editar tarea
- Botón Acciones falso fue reemplazado por Restablecer real.
- Toolbar visual de descripción fue reemplazado por mensaje honesto de campo simple conectado.
- Detalles adicionales ya no muestran inputs decorativos sin respaldo de base de datos.
- Comentarios y adjuntos falsos fueron reemplazados por CTA al detalle operativo real de la tarea cuando se está editando.

## Archivos modificados
- src/app/(app)/app/projects/page.tsx
- src/components/projects/project-detail-pro.tsx
- src/components/tasks/task-action-list.tsx
- src/components/tasks/task-form.tsx
- src/components/ui/copy-current-url-button.tsx

## Validación realizada
- npm ci --prefer-offline --no-audit --no-fund: OK
- npm run typecheck: OK
- build:preflight con variables dummy requeridas: OK

## Nota de build
- npm run build requiere variables reales o dummy para runtime-check.
- Con variables dummy, runtime-check inicia OK, pero next build excedió el tiempo disponible del entorno antes de terminar. TypeScript y preflight quedaron en OK.

## No se tocó
- Supabase schema.
- Migraciones.
- package.json.
- vercel.json.
- Analytics.
- Layout global.
