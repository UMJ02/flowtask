# QA — v58.25.7.2 Boards Hero Cleanup + Inspector Numeric Polish + Minimal Board Previews

## CLI

```bash
npm install
npm run verify:v58.25.7.2
npm run design:doctor
npm run density:guard
npm run density:guard:strict
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```

## Manual

1. Abrir `/app/boards`.
2. Confirmar que el hero ya no muestra la imagen grande.
3. Confirmar que el nuevo preview del hero es minimalista.
4. Revisar templates y confirmar que no se ven íconos/imágenes rotas.
5. Revisar "Mis pizarras recientes".
6. Confirmar que los placeholders son limpios y compactos.
7. Abrir una pizarra.
8. Seleccionar un elemento.
9. Revisar Propiedades > Posición y tamaño.
10. Confirmar que X/Y/W/H muestran números centrados.
11. Confirmar que `px` se ve secundario y alineado.
