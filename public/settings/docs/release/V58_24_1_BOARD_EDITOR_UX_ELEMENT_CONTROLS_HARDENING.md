# v58.24.1 — Board Editor UX + Element Controls Hardening

Base: v58.24.0 Board Canvas Layout Alignment.

## Objetivo
Convertir el módulo Pizarras en una experiencia de editor visual más profesional, corrigiendo la paleta de herramientas, controles de elementos y edición precisa.

## Cambios principales
- Se elimina la rail interna de Pizarras/Plantillas/Archivos/Actividad/Miembros/Ajustes dentro del editor.
- Toolbox se convierte en paleta compacta profesional sin scroll principal.
- Herramientas secundarias quedan bajo botón Más.
- Forma tiene selector de variantes: rectángulo, redondeado, círculo, decisión y píldora.
- Se refuerza la herramienta Mano para pan del lienzo.
- Elementos no conectores tienen resize handles.
- Conectores tienen handles para mover inicio y final.
- Panel de propiedades permite edición manual de X/Y/W/H.
- Panel de propiedades permite cambiar tipo de forma.
- Tablas permiten controlar cantidad de filas/columnas con steppers e inputs numéricos.
- Comentarios anclados pueden moverse, editarse, resolverse y borrarse.

## Sin cambios de Supabase
No se agregan migraciones. Se usa el modelo flexible existente de visual_boards, visual_board_elements y visual_board_comments.
