# v5.7.1 Stabilization

## Saneamiento aplicado
- Se eliminó la ruta dinámica `src/app/manifest.ts` para usar solo `public/manifest.webmanifest`.
- Se endureció `PwaRegister` para no registrar service worker en localhost y evitar ruido de caché durante desarrollo.
- Se corrigieron errores de TypeScript en Intelligence, Reports Print, Workspace OS, Workspace y queries heredadas.

## Objetivo
Dejar el proyecto ejecutable y tipado sobre la base real sin seguir acumulando desfase entre módulos heredados y la arquitectura nueva.
