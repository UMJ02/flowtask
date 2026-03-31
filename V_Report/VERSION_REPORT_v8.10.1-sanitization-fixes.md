# V12 - Saneamiento técnico

## Cambios aplicados
- Se creó `src/app/(app)/app/pizarra/page.tsx` con import correcto usando export nombrado.
- Se corrigió el uso de `InteractiveDashboardBoard` para evitar el fallo de build por default export inexistente.
- Se agregaron protecciones de error en consultas a `organization_members` para que devuelvan fallback seguro en vez de romper el render.
- Se dejó esta versión como base estable para continuar iteraciones de UI.
