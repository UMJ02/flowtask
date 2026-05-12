# QA — v58.22.2

## CLI

```bash
npm run verify:v58.22.2
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```

## QA visual / funcional

1. Crear una tarea con estado Producción.
2. Abrir una tarea existente y cambiar a Producción desde inline.
3. Guardar, recargar y confirmar que el estado persiste.
4. Cambiar Producción a En espera y luego a Concluido.
5. Abrir una tarea en modo edición inline y cambiar Departamento.
6. Guardar, recargar y confirmar que el departamento persiste.
7. Subir una imagen adjunta a una tarea.
8. Confirmar que en la sección principal aparece como fila de lista con icono, nombre, peso y fecha.
9. Confirmar que en el panel lateral de Adjuntos se mantiene la miniatura.
10. Abrir y eliminar adjuntos desde la lista.
