# FlowTask v7.2.0-env-loader-vercel-v3

## Objetivo
Endurecer la continuidad hacia Vercel evitando falsos errores de entorno en `runtime-check`.

## Cambios aplicados
- Se agregó `dotenv` como dependencia para lectura explícita de variables de entorno en scripts Node.
- `scripts/runtime-check.mjs` ahora carga `.env.local` y `.env` desde la raíz del proyecto.
- Se mejoró el mensaje de error cuando no existe ninguno de esos archivos.
- Se mantiene la alerta defensiva para detectar si por error se usa una `service_role` como clave pública.

## Resultado esperado
- `npm run runtime:check` funciona igual en entorno local y antes de `npm run build`.
- El flujo queda más alineado con Vercel y con ejecución manual en terminal.

## Notas
- Esta versión no reintroduce secretos ni artefactos de build.
- La validación final de `npm run build` debe correrse en entorno limpio del usuario o CI/Vercel.
