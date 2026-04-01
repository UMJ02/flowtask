# Flowtask V39 — Home Video Absolute Path + Manifest Silent

## Objetivo
Corregir la reproducción del video de home y limpiar el ruido de consola relacionado con `manifest.webmanifest`.

## Cambios aplicados
- el video ahora usa ruta absoluta directa:
  - `/videos/videointro.mp4`
- el video se monta con `src` directo en la etiqueta `<video>`
- se removió temporalmente la referencia al manifest desde metadata para evitar el 401 en consola

## Nota
Esto no cambia el diseño trabajado en V37; solo corrige:
- reproducción del video
- ruido de consola por el manifest
