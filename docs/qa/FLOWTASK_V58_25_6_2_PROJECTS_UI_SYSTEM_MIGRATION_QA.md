# QA — v58.25.6.2 Projects UI System Migration

## 1. Listado

1. Abrir `/app/projects`.
2. Confirmar hero limpio y alineado al header.
3. Confirmar métricas compactas.
4. Confirmar filtros con controles del sistema.
5. Confirmar tabla/listado sin cards enormes ni textos pegados.

## 2. Acciones

1. Click en Filtros.
2. Click Nuevo proyecto.
3. Abrir un proyecto.
4. Editar proyecto.
5. Confirmar botones consistentes.

## 3. Formulario

1. Abrir `/app/projects/new`.
2. Confirmar inputs/selects con estilo global.
3. Confirmar que no hay elementos pegados al borde.
4. Crear proyecto en ambiente de prueba.

## 4. Detalle

1. Abrir detalle de proyecto.
2. Confirmar hero/detalle compacto.
3. Confirmar métricas del proyecto.
4. Confirmar tabs/secciones.

## 5. Tareas internas y timeline

1. Crear tarea interna.
2. Editar tarea interna.
3. Abrir timeline.
4. Cambiar zoom.
5. Guardar vista.
6. Exportar CSV.

## 6. CLI

```bash
npm install
npm run verify:v58.25.6.2
npm run design:doctor
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
