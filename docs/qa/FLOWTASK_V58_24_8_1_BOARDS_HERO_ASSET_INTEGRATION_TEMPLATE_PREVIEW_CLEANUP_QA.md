# QA — v58.24.8.1 Boards Hero Asset Integration + Template Preview Cleanup

## Objetivo de QA
Confirmar que `/app/boards` usa correctamente los assets reales del hero y de las plantillas sin romper layout, responsive ni interacciones.

## Revisar
- El hero de `/app/boards` usa `hero.png` y se ve proporcionado.
- La mini toolbar usa los 4 iconos reales y se ve limpia.
- El título, subtítulo y CTA del hero no cambian.
- Las cards de plantillas muestran previews reales.
- `Ver todas las plantillas` sigue funcionando.
- `Nueva pizarra` y `Ver plantillas` siguen funcionando.
- El editor `/app/boards/[boardId]` sigue intacto.
- La ruta pública `/share/boards/[token]` sigue intacta.
