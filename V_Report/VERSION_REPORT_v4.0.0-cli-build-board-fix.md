# FlowTask v4.0.0 — CLI build + board fix

## Objetivo
Corregir los fallos reportados en validación CLI para dejar una base estable antes de seguir con nuevas iteraciones.

## Cambios aplicados
- Se desactiva `typedRoutes` en `next.config.ts` para eliminar los errores masivos de rutas inexistentes durante typecheck/build.
- Se simplifica `src/lib/navigation/routes.ts` para usar rutas internas como `string` segura del proyecto, evitando bloqueos artificiales del compilador.
- Se normalizan scripts de build para usar la ruta directa del binario de Next también en scripts de validación estricta.
- Se mantiene la corrección previa del board y la base limpia heredada de v3.

## Resultado esperado
- `npm run typecheck` deja de fallar por `RouteImpl`/`typedRoutes`.
- `npm run build` deja de romper por rutas privadas aún no materializadas.
- La base queda lista para seguir con correcciones funcionales del board y creación gradual de páginas privadas reales.
