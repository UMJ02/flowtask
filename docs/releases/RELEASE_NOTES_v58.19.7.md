# Flowtask v58.19.7 — Dependency-Free XLSX Report + Public Landing Cleanup

Base validada: `flowtask_V58.19.6_Analytics_Share_Build_Fix_FULL.zip`.

## Cambios principales

- Exportación `.xlsx` real sin agregar dependencias nuevas.
- Se evita `exceljs` para que `npm install` no agregue paquetes pesados.
- El alias `downloadAnalyticsCsv` se mantiene para no romper imports existentes, pero ahora descarga Excel real.
- Hojas del Excel: `Reporte`, `Tareas exportadas`, `Resumen`, `Diccionario`.
- Estilos OpenXML: encabezados, bordes, anchos, filtros, freeze header, estados y prioridades con fondos.
- Landing pública limpia: sin panel lateral de resumen y con botones al final en horizontal.

## Nota CLI

`npm warn EBADENGINE` con Node 22 es warning, no error fatal. Además, `npm run dev` queda abierto porque levanta el servidor local.
