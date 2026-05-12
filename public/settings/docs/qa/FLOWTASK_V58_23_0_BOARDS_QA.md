# QA — v58.23.0 Boards Foundation + Visual Canvas MVP

## CLI

```bash
npm run verify:v58.23.0
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```

## Supabase

Aplicar:

```txt
supabase/migrations/0045_v58_23_0_visual_boards_foundation.sql
```

## QA manual

1. Abrir `/app/boards`.
2. Crear una nueva pizarra.
3. Confirmar que abre `/app/boards/[boardId]`.
4. Cambiar el nombre de la pizarra y esperar “Guardado”.
5. Insertar una nota adhesiva.
6. Insertar texto.
7. Insertar una forma.
8. Insertar una tabla.
9. Mover elementos en el canvas.
10. Editar texto inline.
11. Duplicar un elemento con la toolbar.
12. Borrar un elemento.
13. Recargar la página.
14. Confirmar que la pizarra conserva elementos y posición.
15. Volver a `/app/boards` y confirmar que la pizarra aparece en el listado.
