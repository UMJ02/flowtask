# QA — v58.25.9.7 Workspace Empty States + Client QA Hardening

## Checklist funcional
- Abrir `/app/workspace` sin proyecto activo.
- Validar estado vacío cuando no hay proyectos visibles.
- Validar Migration Guard si falta alguna tabla o RLS bloquea escritura.
- Abrir proyecto sin tareas y validar Lista, Board, Tabla, Timeline y Reportes.
- Abrir proyecto sin archivos y validar Archivos + acción de subir/volver.
- Abrir proyecto sin pizarras y validar Canvas + CTA a Pizarras.
- Abrir usuario de solo lectura y confirmar que aparecen mensajes de permisos.
- Validar Right Panel: Workspace Health, archivos recientes vacíos y vencimientos vacíos.

## Escenarios de cliente
1. Workspace personal sin proyectos: debe mostrar CTA a Proyectos.
2. Workspace organización sin permisos de edición: debe mostrar modo solo lectura.
3. Proyecto con migraciones aplicadas: Workspace Health debe mostrar Persistence/Spaces/Saved views OK.
4. Proyecto sin tareas: no debe verse roto; debe sugerir Lista/Tabla/Timeline.
5. Proyecto con tareas pero sin fechas: Timeline debe explicar que faltan fechas.
6. Proyecto sin archivos: FilesView debe permitir upload si hay permiso.
7. Proyecto sin pizarras: Canvas debe redirigir a Pizarras.

## No regresión
- No se reemplaza `/app/tasks`.
- No se reemplaza `/app/projects`.
- No se reemplaza `/app/boards`.
- No se reemplaza `/app/reports`.
- No se toca `safe_delete_visual_board`.
- No se agregan dependencias ni migraciones.
