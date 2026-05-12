# FlowTask — v58.25.7.2 Boards Hero Cleanup + Inspector Numeric Polish + Minimal Board Previews

Base: **v58.25.7.1 — Deep Density Component Refactor + Hardcoded Style Cleanup**

## Objetivo

Refinar Pizarras para eliminar peso visual innecesario y hacer que el módulo se sienta más minimalista, compacto y profesional.

## Cambios principales

- Se elimina la ilustración grande del hero de Pizarras.
- Se reemplaza por un preview minimalista CSS-based.
- Se eliminan dependencias de imágenes grandes en previews de templates.
- Las tarjetas recientes usan un placeholder minimalista más limpio.
- Los previews de "crear nueva pizarra" y templates se sienten más pro y menos rotos.
- Los inputs de Posición y tamaño del inspector centran los números.
- Se ocultan spinners nativos de number input para evitar look desalineado.
- Se agrega estilo `board-inspector-metric` para X/Y/W/H.

## Validación recomendada

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
