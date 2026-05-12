# FlowTask Boards — Realtime Collaboration

## Arquitectura

El módulo usa un canal por pizarra:

```ts
supabase.channel(`visual-board:${boardId}`, { config: { presence: { key: userId } } })
```

## Presence

Payload de presencia:

```ts
{
  userId,
  email,
  name,
  color,
  cursor: { x, y } | null,
  lastSeenAt
}
```

Los cursores se renderizan dentro del canvas transformado para respetar pan/zoom.

## Postgres changes

Se escuchan cambios de:

- `visual_board_elements`
- `visual_board_comments`
- `visual_board_activity`
- `visual_board_collaborators`
- `visual_boards`

## Seguridad operativa

La UI evita sobreescribir elementos que el usuario actual está editando o arrastrando:

```ts
if (dirtyMapRef.current[targetId] || dragStateRef.current?.id === targetId) return;
```

## Limitaciones

No hay locks ni resolución profunda de conflictos. La estrategia actual es suficiente para colaboración base y visualización en vivo.
