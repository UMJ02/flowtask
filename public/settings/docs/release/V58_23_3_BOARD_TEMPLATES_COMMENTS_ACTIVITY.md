# v58.23.3 — Board Templates + Comments Activity

Base: v58.23.2 — Board Tables + Inline Editing
Stage: production-candidate

## Objetivo

Acelerar la creación de pizarras con plantillas iniciales y agregar seguimiento humano mediante comentarios y actividad básica.

## Incluye

- Plantillas rápidas en `/app/boards`.
- Plantillas: pizarra en blanco, diagrama de flujo, plan de proyecto, reunión con cliente, mapa de ideas y wireframe landing.
- Inserción automática de elementos iniciales al crear una pizarra desde plantilla.
- Panel `BoardCommentsActivity` dentro del canvas.
- Comentarios de pizarra y comentarios ligados al elemento seleccionado.
- Actividad básica para creación de board, aplicación de plantilla, elementos creados, duplicados, eliminados, tablas cambiadas y comentarios.
- Migración `0046_v58_23_3_board_templates_comments_activity.sql`.
- Hardening del constraint de `visual_board_elements.type` para permitir `connector` en bases creadas con v58.23.0.

## Sin cambios

- No toca tareas/proyectos.
- No cambia RLS existente fuera del módulo Boards.
- No agrega realtime todavía.
- No agrega share/collaboration layer todavía.
