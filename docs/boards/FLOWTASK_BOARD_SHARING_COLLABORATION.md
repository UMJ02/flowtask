# FlowTask Boards — Sharing + Collaboration Layer

La capa de compartir usa `visual_boards.visibility`, `share_token` y `public_can_edit`.

## Tablas
- `visual_boards`: metadata de la pizarra y enlace público.
- `visual_board_elements`: elementos visuales persistidos.
- `visual_board_comments`: comentarios de pizarra.
- `visual_board_activity`: actividad humana.
- `visual_board_collaborators`: acceso directo por usuario/email y rol.

## Roles
- viewer: puede ver.
- editor: preparado para editar en fases futuras.
- admin: preparado para administración avanzada.

## Vista pública
`/share/boards/[token]` carga la pizarra por `share_token` cuando `visibility = public_link`.
La vista pública inicial es de solo lectura para evitar cambios anónimos accidentales.
