# VERSION REPORT v7.6.3-manifest-preview-disable

## Objetivo
Eliminar por completo la referencia al manifest en previews/proyectos protegidos para cortar el 401 en `manifest.webmanifest`.

## Cambios aplicados
- Se eliminó `manifest: "/manifest.webmanifest"` del metadata raíz en `src/app/layout.tsx`.
- Se mantiene PWA UI opcional, pero sin inyectar manifest en el HTML base.
- En hosts `*.vercel.app`, `PwaRegister` ahora intenta desregistrar service workers existentes para reducir arrastre de caché/manifest previo.

## Resultado esperado
- El navegador ya no debe solicitar `manifest.webmanifest` por el HTML del layout.
- En previews/protected deployments de Vercel debe desaparecer el 401 del manifest después de redeploy y recarga dura/limpieza de caché.
