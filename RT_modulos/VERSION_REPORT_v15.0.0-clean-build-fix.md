# Flowtask V15 — Clean Build Fix

## Objetivo
Aplicar de forma limpia y verificable los dos arreglos que seguían pendientes:
- tipo `TaskRow` en `interactive-dashboard-board`
- clases Tailwind inválidas en `globals.css`

## Cambios aplicados
- Corrección de clases inválidas:
  - `bg-white/88` → `bg-white/[0.88]`
  - `bg-white/72` → `bg-white/[0.72]`
  - `bg-white/82` → `bg-white/[0.82]`
  - `bg-white/92` → `bg-white/[0.92]`
- Tipo `TaskRow` ampliado con:
  - `updated_at?: string | null`
- Estabilización adicional de `updatedAt` con valores deterministas.

## Validación recomendada
```bash
rm -rf node_modules .next
npm install
npm run verify:v15
npm run typecheck
npm run build
npm run dev
```
