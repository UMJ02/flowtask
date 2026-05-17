# v58.28.1 — Workspace Pro User Final UI Fixes

Base: v58.28.0 — Workspace Pro Production UX Final.

Objetivo: corregir detalles visuales reales detectados en navegador antes de considerar Workspace Pro listo para usuario final.

## Cambios

- Board: los botones de movimiento en tarjetas completas ahora son chips pequeños y compactos.
- Board: se reducen textos largos como “Mover a...” para evitar cards infladas.
- Editor de tarea: Estado, Prioridad, Abrir detalle y Editar completa quedan en una misma línea operativa en desktop.
- Editor de tarea: mantiene scroll horizontal suave si la pantalla es estrecha.
- Spaces Manager: el sheet ancho pasa a 1120px máximo para evitar compresión.
- Spaces Manager: se reemplaza el grid rígido por layout responsive propio.
- Spaces Manager: cards de creación, estado de persistencia y listado ya no se montan desordenados.

## Sin cambios críticos

No toca Supabase schema, RLS, migraciones, safe_delete_visual_board, rutas clásicas ni dependencias.
