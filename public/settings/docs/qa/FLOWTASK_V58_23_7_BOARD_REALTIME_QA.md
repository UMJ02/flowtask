# QA — v58.23.7 Board Realtime Collaboration

## Supabase

Aplicar:

```sql
supabase/migrations/0049_v58_23_7_board_realtime_collaboration.sql
```

Validar que las tablas estén en la publicación `supabase_realtime`.

## Pruebas manuales

### Presencia

1. Abrir `/app/boards/[boardId]` en dos navegadores/sesiones.
2. Mover el mouse sobre el canvas en una sesión.
3. Confirmar que aparece un cursor remoto con nombre/color en la otra sesión.
4. Sacar el mouse del canvas y confirmar que el cursor desaparece o queda sin posición.

### Elementos

1. Crear nota en sesión A.
2. Confirmar que aparece en sesión B.
3. Mover nota en sesión A.
4. Confirmar que cambia de posición en sesión B.
5. Borrar nota en sesión A.
6. Confirmar que desaparece en sesión B.

### Comentarios y actividad

1. Agregar comentario anclado en sesión A.
2. Confirmar que aparece en sesión B.
3. Confirmar que la actividad se actualiza.

### Sharing

1. Abrir panel Compartir en sesión A.
2. Activar enlace público.
3. Confirmar que sesión B refleja el cambio al recibir update de board.
