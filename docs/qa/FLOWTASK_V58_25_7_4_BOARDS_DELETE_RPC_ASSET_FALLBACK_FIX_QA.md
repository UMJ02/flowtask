# QA — v58.25.7.4 Boards Delete RPC + Asset Fallback Fix

## CLI

```bash
npm install
npm run verify:v58.25.7.4
npm run design:doctor
npm run density:guard
npm run density:guard:strict
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```

## Supabase obligatorio

Aplicar:

```sql
supabase/migrations/0055_v58_25_7_4_visual_board_safe_delete_rpc.sql
```

## Manual

1. Abrir `/app/boards`.
2. Confirmar que Diagrama de flujo no da 404.
3. Crear una pizarra.
4. Borrarla desde la vista de pizarras.
5. Confirmar que desaparece sin 403.
6. Confirmar en BD que `visual_boards.deleted_at` quedó con fecha.
