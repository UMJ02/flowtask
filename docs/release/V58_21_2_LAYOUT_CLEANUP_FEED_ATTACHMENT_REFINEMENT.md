# v58.21.2 — Layout Cleanup + Feed & Attachment Refinement

## Base
v58.21.1 — User Language + Interaction Cleanup.

## Objetivo
Cerrar la experiencia visual de tareas y proyectos para usuario final sin cambiar Supabase, RLS ni contratos de datos.

## Cambios incluidos
- Feed operativo de tareas dividido en dos bloques: Comentarios y Actividad del sistema.
- Comentarios y movimientos del sistema con límite inicial y controles Ver más / Ver menos.
- Copy del feed más humano y menos técnico.
- Adjuntos con thumbnails reales para imágenes y tarjetas más útiles para archivos.
- Archivos recientes del proyecto con thumbnails reales cuando el adjunto es imagen.
- Barra de filtros de proyectos simplificada con Más filtros para opciones secundarias.
- Tabla de proyectos con menor ancho mínimo y sin columna de prioridad falsa.
- Tareas internas del proyecto con quick-add responsive para evitar desbordes.
- Sistema visual más consistente: botones, inputs, tarjetas y textos más compactos.

## Sin cambios de base de datos
- No se agregaron migraciones.
- No se agregaron columnas.
- No se cambió RLS.
- No se cambió el contrato de creación/edición de tareas o proyectos.

## Validación esperada
```bash
npm run verify:v58.21.2
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
