# FlowTask Boards — Tables + Inline Editing

Las tablas visuales son elementos del canvas. Se pueden mover como cualquier elemento, pero también permiten edición directa de celdas.

## Modelo

```ts
TableElement = {
  type: 'table',
  columns: Array<{ id: string; label: string; width: number }>,
  rows: Array<{ id: string; cells: Record<string, string> }>,
}
```

## Interacción

- Click selecciona la tabla.
- Edición de celda ocurre inline usando controles internos.
- Los inputs de celda detienen `pointerDown` para evitar drag accidental.
- Toolbar flotante permite agregar fila/columna.
- Panel de propiedades permite renombrar/eliminar columnas.
- Autosave usa la persistencia existente por debounce.

## Regla operativa

Las tablas no tienen tabla Supabase propia. Viven como JSON dentro de `visual_board_elements.data` para mantener flexibilidad de pizarra.
