# v58.24 — Board Canvas Layout Alignment

Base: v58.23.7 — Board Realtime Collaboration
Estado: production-candidate

## Objetivo
Alinear la vista de Pizarras con el blueprint visual del módulo Pizarra + Creador de Componentes, corrigiendo el desvío donde Comentarios/Actividad se superponía con Herramientas y saturaba el canvas.

## Cambios
- Nueva rail lateral de Pizarras dentro del editor: Pizarra, Plantillas, Archivos, Actividad, Miembros y Ajustes.
- Header ajustado a 72px con estructura más cercana al blueprint.
- Toolbox rediseñado como panel vertical compacto de 92px, con botones 62px y grupos visuales.
- Comentarios/Actividad dejó de estar siempre abierto y cruzado sobre herramientas.
- Nuevo drawer compacto de Seguimiento:
  - cerrado por defecto como botón pequeño.
  - al abrirse aparece a la derecha del toolbox, sin taparlo.
  - pestañas Comentarios / Actividad.
  - lista con scroll interno para evitar crecer hacia abajo.
- Se mantiene todo lo construido previamente: conectores, tablas, plantillas, sharing, archivos, minimap, shortcuts y realtime.
- No se agregan migraciones Supabase.
- No se cambia RLS.

## Motivo
El PDF indica una estructura clara: sidebar global, topbar, panel de herramientas, canvas, toolbar contextual, panel de propiedades, minimap y barra inferior. La actividad y comentarios no deben invadir el panel de herramientas ni convertirse en una lista larga dentro del lienzo.
