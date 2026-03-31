# Flowtask V11 — Hotfix Build + RLS

## Objetivo
Corregir dos bloqueos reales detectados en ejecución:
- build roto por clases Tailwind inválidas
- error 500 en `organization_members` asociado a la policy RLS

## Cambios aplicados

### 1) Hotfix de build
Se reemplazaron clases de opacidad no válidas en Tailwind como:
- `bg-white/88` → `bg-white/[0.88]`
- `bg-white/72` → `bg-white/[0.72]`
- `bg-white/82` → `bg-white/[0.82]`
- `bg-white/92` → `bg-white/[0.92]`

También se corrigieron variantes similares en archivos del sistema visual.

### 2) Hotfix SQL para RLS
Se agregó:
- `supabase/sql/v11_hotfix_organization_members_rls.sql`

Este script redefine la policy de lectura de `organization_members` y mueve la verificación de rol a funciones `security definer` para reducir el riesgo de recursión en RLS.

## Ejecución recomendada
```bash
npm install
npm run build
npm run dev
npm run hotfix:notes
```

Luego ejecutar en Supabase SQL Editor:
- `supabase/sql/v11_hotfix_organization_members_rls.sql`

## Nota honesta
Este hotfix ataca los dos bloqueos reales reportados por el usuario. El error React 418 debe reevaluarse después de aplicar estas correcciones, porque puede ser un efecto colateral del build roto y/o de la falla 500 del workspace.
