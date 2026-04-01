# Flowtask V38 — Home Video Path Fix

## Objetivo
Corregir la carga del video de fondo en home tomando como base la V37.

## Cambios aplicados
- se ajustó el source del video para usar la ruta:
  - `videos/videointro.mp4`
- se agregó `poster` de fallback
- se mantuvo el video como background en desktop

## Nota
Si aún no reproduce después de esto, lo siguiente a revisar ya no sería el componente sino:
- nombre exacto del archivo
- extensión real
- que el archivo exista físicamente en `public/videos/`
