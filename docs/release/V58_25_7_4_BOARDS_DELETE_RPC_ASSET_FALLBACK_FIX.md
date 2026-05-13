# v58.25.7.4 — Boards Delete RPC + Asset Fallback Fix

## Problemas corregidos

1. `diagrama_fujo.png` devolvía 404 en algunos entornos porque el nombre correcto esperado puede ser `diagrama_flujo.png`.
2. El borrado de pizarras devolvía 403 porque el soft delete actualizaba `deleted_at`, pero la policy `visual_boards_update_access` tenía `WITH CHECK (deleted_at is null)`.
3. La llamada `.update(...).select("id")` puede fallar luego de soft delete porque la policy SELECT oculta filas con `deleted_at is not null`.

## Solución

- Se agrega `public/boards-home/diagrama_flujo.png` como alias correcto.
- El código usa `/boards-home/diagrama_flujo.png`.
- Se agrega migración:
  - `supabase/migrations/0055_v58_25_7_4_visual_board_safe_delete_rpc.sql`
- Se agrega RPC:
  - `public.safe_delete_visual_board(p_board_id uuid)`
- `BoardsHome.deleteBoard()` ahora usa la RPC y no update directo con `.select("id")`.
