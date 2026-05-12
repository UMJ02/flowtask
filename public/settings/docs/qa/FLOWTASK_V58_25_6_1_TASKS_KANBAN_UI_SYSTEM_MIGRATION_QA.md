# QA — v58.25.6.1 Tasks + Kanban UI System Migration

## 1. Lista de tareas

1. Abrir `/app/tasks`.
2. Confirmar tabla limpia, compacta y alineada.
3. Confirmar que las filas no tienen padding exagerado.
4. Confirmar que textos largos hacen wrap/truncate correcto.
5. Confirmar que checkboxes se ven con estilo FlowTask.

## 2. Importantes

1. Marcar una tarea como importante.
2. Confirmar que se resalta sin mover/reordenar la tabla.
3. Quitar importante.
4. Confirmar que vuelve al estado normal.

## 3. Acciones

1. Probar ver.
2. Probar editar.
3. Probar finalizar.
4. Probar eliminar.
5. Confirmar que los botones se ven alineados y del mismo tamaño.

## 4. Kanban

1. Cambiar a vista Kanban si aplica.
2. Confirmar 4 columnas en desktop.
3. Confirmar cards más compactas.
4. Arrastrar tarea entre columnas.
5. Confirmar que el drop target se resalta.
6. Confirmar que las tareas permanecen en la columna correcta por estado.

## 5. Filtros y formulario

1. Probar búsqueda.
2. Probar selects.
3. Probar checkbox de concluidas.
4. Crear una tarea.
5. Editar una tarea.
6. Confirmar que inputs/selects se ven con el sistema base.

## 6. CLI

```bash
npm install
npm run verify:v58.25.6.1
npm run design:doctor
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
