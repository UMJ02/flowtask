# QA — v58.24.5 Board Toolbar Collapse Animation Fix

## Ruta

- `/app/boards/[boardId]`

## Checklist visual

1. Abrir una pizarra.
2. Ver la toolbar expandida.
3. Contraer la toolbar.
4. Confirmar que los iconos superiores no se desbordan.
5. Confirmar que no aparecen textos saliendo del contenedor durante la animación.
6. Confirmar que no aparece fondo negro accidental durante el colapso.
7. Confirmar que en modo colapsado solo se ven iconos.
8. Confirmar que el tooltip al hover es claro y premium.
9. Confirmar que el botón de ocultar queda dentro de la toolbar sin romper layout.
10. Ocultar toolbar.
11. Confirmar que el botón flotante aparece correctamente.
12. Mostrar toolbar desde el botón flotante.
13. Expandir toolbar.
14. Confirmar que icono + texto vuelven correctamente.
15. Mover la toolbar y recargar.
16. Confirmar que la posición se guarda.

## Checklist funcional

1. Seleccionar herramienta.
2. Usar Forma y abrir variantes.
3. Abrir Más.
4. Probar Imagen / Archivo si Storage está configurado.
5. Abrir Limpiar pizarra y cancelar.
6. Confirmar que no se pierde ningún elemento.
7. Volver a abrir Limpiar pizarra y borrar todo si se desea probar la acción.

## Comandos

```bash
npm run verify:v58.24.5
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
