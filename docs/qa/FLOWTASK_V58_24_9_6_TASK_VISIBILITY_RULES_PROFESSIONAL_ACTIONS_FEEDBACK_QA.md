# QA — v58.24.9.6 Task Visibility Rules + Professional Actions Feedback

## 1. Visibilidad en listado

1. Crear tarea independiente activa.
2. Crear tarea dentro de proyecto activa.
3. Crear tarea concluida.
4. Abrir `/app/tasks`.
5. Confirmar que aparecen las tareas activas independientes y de proyecto.
6. Confirmar que la concluida no aparece por defecto.
7. Activar `Incluir concluidas`.
8. Confirmar que aparece la concluida.
9. Entrar a `/app/tasks?status=concluido`.
10. Confirmar que solo muestra concluidas.

## 2. Kanban

1. Abrir dashboard/workspace.
2. Confirmar columnas:
   - En progreso
   - Producción
   - En espera
   - Hecho
3. Confirmar que las tareas concluidas aparecen en `Hecho`.
4. Ocultar una columna y confirmar que sus tareas no se mueven a otra.

## 3. Eliminar desde listado

1. Abrir `/app/tasks`.
2. Click en eliminar.
3. Confirmar que aparece confirmación visual, no alerta del navegador.
4. Cancelar y confirmar que no borra.
5. Repetir y confirmar eliminación.

## 4. Eliminar desde detalle

1. Abrir detalle de tarea.
2. Click en `Eliminar`.
3. Confirmar modal visual.
4. Cancelar.
5. Repetir y confirmar.
6. Confirmar redirección a `/app/tasks`.

## 5. CLI

```bash
npm install
npm run verify:v58.24.9.6
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
