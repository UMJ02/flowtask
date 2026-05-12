# QA — v58.22.4 Data Sync Reliability

## Tarea inline

1. Abrir `/app/tasks/[id]`.
2. Entrar en modo edición.
3. Cambiar estado, prioridad, fecha, cliente y departamento.
4. Guardar.
5. Recargar con Cmd+R.
6. Confirmar que los cambios persisten.
7. Confirmar en Supabase `tasks` que `status`, `priority`, `due_date`, `client_name` y `department_id` quedaron actualizados.

## Proyecto inline

1. Abrir `/app/projects/[id]?mode=edit`.
2. Cambiar título, estado, registro, país, fecha o colaborativo.
3. Guardar.
4. Recargar.
5. Confirmar que los datos persisten.

## Workspace / tablero

1. Mover una tarea a Producción.
2. Recargar.
3. Confirmar que queda en Producción.
4. Mover una tarea a En espera.
5. Recargar.
6. Confirmar que queda en En espera.

## Tareas internas del proyecto

1. Crear tarea interna.
2. Editarla.
3. Marcarla como concluida.
4. Eliminarla.
5. Confirmar que cada acción persiste tras recargar.

## Adjuntos

1. Subir un archivo.
2. Recargar y confirmar que aparece.
3. Eliminarlo.
4. Recargar y confirmar que ya no aparece.

## Criterio de aprobación

- La UI no debe mostrar éxito si Supabase no confirma una fila.
- Si RLS bloquea una mutación, la UI debe revertir o mostrar error.
- No debe haber cambios visuales o de esquema en esta versión.
