# FlowTask v1.0.0-canon

Base canónica estabilizada para continuar el proyecto sin seguir metiendo cambios improvisados.

## Estado de esta versión
- `npm run typecheck` en cero errores
- rutas centralizadas en `src/lib/navigation/routes.ts`
- login con sanitización del parámetro `next`
- notificaciones live corregidas y consistentes
- permisos `canUser()` corrigiendo ejecución real de la consulta
- helpers de Supabase server/middleware tipados
- tipos base `Database` mínimos y explícitos

## Objetivo de esta versión
Cerrar la deuda técnica inicial y dejar una base confiable para entrar a validación funcional en la siguiente versión.

## Próxima versión
`v1.1.0-runtime`
- validación de flujos auth
- dashboard
- clientes
- proyectos
- tareas
- notificaciones
- estados vacíos, errores y navegación

## Scripts
- `npm install`
- `npm run dev`
- `npm run typecheck`

## Nota
Esta versión corrige estabilidad y tipado. No introduce features nuevas.
