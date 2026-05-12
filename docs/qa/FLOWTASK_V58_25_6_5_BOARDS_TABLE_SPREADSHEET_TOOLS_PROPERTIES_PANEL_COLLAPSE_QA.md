# QA — v58.25.6.5 Boards Table Spreadsheet Tools + Properties Panel Collapse

## 1. Selección

1. Abrir una pizarra.
2. Crear o seleccionar una tabla.
3. Click en una celda.
4. Click en encabezado de columna.
5. Click en número de fila.
6. Confirmar highlight verde suave.

## 2. Click derecho

1. Click derecho en una fila.
2. Confirmar menú contextual.
3. Eliminar fila.
4. Click derecho en columna.
5. Eliminar columna.
6. Confirmar que no rompe la tabla.

## 3. Ocultar / mostrar

1. Click derecho en fila.
2. Ocultar fila.
3. Confirmar que desaparece.
4. Usar botón Mostrar filas.
5. Repetir con columna.

## 4. Color

1. Seleccionar fila.
2. Click en una bolita de color de toolbar.
3. Confirmar color aplicado a fila.
4. Seleccionar columna y aplicar color.
5. Seleccionar celda y aplicar color.

## 5. Fórmulas

1. Escribir `10` en A1.
2. Escribir `5` en B1.
3. Escribir `=A1+B1` en C1.
4. Salir de la celda.
5. Confirmar resultado `15`.
6. Probar `=SUM(A1:B1)`.

## 6. Autorrelleno

1. Escribir `1` en una celda.
2. Usar el handle verde de autorrelleno.
3. Confirmar continuidad hacia abajo.
4. Probar texto y fecha.

## 7. Panel de propiedades

1. Abrir panel derecho.
2. Click en contraer.
3. Confirmar panel mini.
4. Click en expandir.
5. Confirmar panel completo.

## 8. CLI

```bash
npm install
npm run verify:v58.25.6.5
npm run design:doctor
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
