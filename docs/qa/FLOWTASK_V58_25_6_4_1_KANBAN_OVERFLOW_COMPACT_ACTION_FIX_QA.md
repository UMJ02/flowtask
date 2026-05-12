# QA — v58.25.6.4.1 Kanban Overflow + Compact Action Fix

## 1. Desktop

1. Abrir `/app/tasks`.
2. Cambiar a Kanban.
3. Confirmar que ninguna tarjeta se sale de la columna.
4. Confirmar que los iconos inferiores no se cortan fuera del card.
5. Revisar columnas Producción y En espera.

## 2. Acciones

1. Marcar importante.
2. Quitar importante.
3. Mover entre estados con los iconos.
4. Abrir tarea con icono de carpeta.
5. Confirmar que la fila de acciones se mantiene dentro del card.

## 3. Responsive

1. Probar ancho tipo 1280px–1535px.
2. Probar móvil.
3. Confirmar que las acciones no empujan el card.

## 4. CLI

```bash
npm install
npm run verify:v58.25.6.4.1
npm run design:doctor
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
