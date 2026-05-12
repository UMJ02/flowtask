# QA — v58.23.5 Board History + Shortcuts + Minimap

## Comandos

```bash
npm run verify:v58.23.5
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```

## Rutas

- `/app/boards`
- `/app/boards/[boardId]`
- `/share/boards/[token]`

## Validación de historial

- Crear elemento y deshacer.
- Editar texto y deshacer/rehacer.
- Mover elemento y deshacer/rehacer.
- Duplicar y deshacer.
- Borrar y deshacer.

## Validación de atajos

- `V`: seleccionar.
- `H`: mano/pan.
- `N`: nota.
- `T`: texto.
- `R`: forma.
- `L`: conector.
- `Cmd/Ctrl + D`: duplicar.
- `Delete` / `Backspace`: borrar.
- `Cmd/Ctrl + Z`: undo.
- `Cmd/Ctrl + Shift + Z` / `Cmd/Ctrl + Y`: redo.

## Validación de minimap

- El minimap muestra elementos del canvas.
- El rectángulo de viewport aparece.
- Click en minimap reposiciona la vista.
- El porcentaje de zoom se actualiza.

## Validación de persistencia

- Hacer cambios.
- Esperar estado guardado.
- Recargar.
- Confirmar que el estado final persiste.

## No regresiones

- Compartir sigue abriendo panel.
- Link público sigue cargando `/share/boards/[token]`.
- Comentarios/actividad siguen visibles.
- Conectores siguen renderizando.
- Tablas siguen editables.
