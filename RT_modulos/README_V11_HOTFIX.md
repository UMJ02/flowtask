# Flowtask V11 Hotfix

## Incluye
- corrección de clases Tailwind inválidas que rompían el build
- script SQL para hotfix de `organization_members`
- notas de verificación del hotfix

## Comandos
- `npm run hotfix:notes`
- `npm run v11:check`

## Paso adicional obligatorio
Ejecutar en Supabase SQL Editor:
- `supabase/sql/v11_hotfix_organization_members_rls.sql`
