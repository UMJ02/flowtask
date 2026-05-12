# v58.23.7 — Board Realtime Collaboration

Base: v58.23.6 — Board Anchored Comments + Files
Estado: production-candidate

## Objetivo

Agregar colaboración en tiempo real al módulo de Pizarras sin cambiar el modelo visual ni romper el MVP existente.

## Incluye

- Canal Supabase Realtime por pizarra: `visual-board:{boardId}`.
- Presencia de usuarios conectados.
- Cursores remotos con nombre y color.
- Sincronización realtime de elementos de pizarra.
- Sincronización realtime de comentarios.
- Sincronización realtime de actividad.
- Sincronización realtime de colaboradores.
- Sincronización de cambios de sharing de la pizarra.
- Protección básica contra sobreescribir cambios locales sucios o elementos que el usuario está arrastrando.
- Migración `0049_v58_23_7_board_realtime_collaboration.sql` para habilitar tablas en `supabase_realtime`.

## No incluye todavía

- Resolución avanzada de conflictos multiusuario.
- Locks por elemento.
- Edición colaborativa carácter por carácter.
- Chat en vivo.

## QA mínimo

1. Abrir la misma pizarra en dos navegadores.
2. Confirmar presencia/cursor remoto.
3. Crear un elemento en una ventana y verlo aparecer en la otra.
4. Mover un elemento y verlo actualizarse en la otra ventana.
5. Agregar comentario y verlo aparecer en la otra ventana.
6. Invitar colaborador o cambiar sharing y confirmar sincronización.
