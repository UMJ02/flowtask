# QA — FlowTask v58.21.2 Layout, Feed & Attachments

## Tarea detalle
Ruta: `/app/tasks/[id]`

Validar:
- Feed operativo muestra Comentarios y Actividad del sistema uno al lado del otro en desktop.
- En mobile ambos bloques se apilan correctamente.
- Comentarios muestran máximo 3 inicialmente.
- Si hay más comentarios, aparece Ver más comentarios / Ver menos comentarios.
- Actividad muestra máximo 4 inicialmente.
- Si hay más movimientos, aparece Ver más movimientos / Ver menos movimientos.
- El comentario nuevo se guarda y refresca correctamente.
- La actividad del sistema sigue mostrando cambios de checklist, archivos y tarea.

## Adjuntos de tarea
Ruta: `/app/tasks/[id]#attachments`

Validar:
- Imágenes muestran thumbnail real.
- PDF, XLS, ZIP u otros archivos muestran icono de tipo.
- Abrir archivo funciona cuando hay URL pública.
- Eliminar archivo funciona si el usuario tiene permiso.
- Estado vacío se mantiene claro.

## Proyectos lista
Ruta: `/app/projects`

Validar:
- Buscador, Estado, Departamento, Más filtros, Aplicar y Limpiar no se desbordan.
- Más filtros muestra Tipo y Cliente.
- La tabla no expone prioridad falsa.
- Acciones de Ver y Editar siguen visibles.
- El scroll horizontal, si aparece, no corta los controles principales.

## Proyecto detalle
Ruta: `/app/projects/[id]`

Validar:
- Archivos recientes muestran thumbnail si son imágenes.
- Tareas del proyecto no desbordan.
- La fila de nueva tarea se adapta en desktop, tablet y mobile.
- Botón Agregar no se monta sobre otros inputs.
- Avance del proyecto sigue actualizando con tareas internas.

## Proyecto inline edit
Ruta: `/app/projects/[id]?mode=edit`

Validar:
- Guardar proyecto funciona.
- Cancelar proyecto funciona.
- La estructura de detalle no cambia.
- Tabs, tareas, archivos y actividad siguen accesibles.
