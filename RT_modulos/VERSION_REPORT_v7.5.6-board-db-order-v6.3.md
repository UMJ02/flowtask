# FlowTask v7.5.6-board-db-order-v6.3

## Objetivo
Pulir el flujo de Pizarra usando la base real de Supabase sin inventar estructura nueva.

## Base de datos validada
- `public.tasks` sí tiene `status`, `due_date`, `updated_at`, `created_at` y no trae una columna nativa de orden manual por columna.
- `public.boards` sí trae `layout_config jsonb`, que es el lugar correcto para persistir preferencias visuales del tablero por usuario.

## Cambios aplicados
- El flujo ahora puede mostrar `Ver más` por columna cuando existen más de 5 tareas.
- El orden manual del flujo se persiste en `boards.layout_config` usando:
  - `kanbanStatusOverrides`
  - `kanbanOrderOverrides`
- El drag and drop ahora soporta:
  - mover entre columnas
  - reordenar dentro de la misma columna al soltar sobre otra tarjeta
- Se mantiene fallback local en `localStorage` para no perder experiencia si el roundtrip de red tarda.

## Compatibilidad
- No requiere inventar columnas nuevas en `tasks`.
- No rompe el deploy actual porque reutiliza tablas y RLS existentes.

## Siguiente paso recomendado
- Si quieres persistencia compartida entre miembros de equipo y no por usuario, ahí sí conviene una tabla nueva de posiciones por board/task.
