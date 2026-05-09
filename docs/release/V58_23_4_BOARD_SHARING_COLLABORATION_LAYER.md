# v58.23.4 — Board Sharing + Collaboration Layer

Base: v58.23.3 Board Templates + Comments Activity.

## Objetivo
Agregar una capa inicial de compartir y colaboración para el módulo Pizarras, sin tocar tareas, proyectos ni contratos existentes.

## Incluye
- Panel de compartir dentro de la pizarra.
- Activación/desactivación de enlace público.
- Generación de `share_token`.
- Vista pública de solo lectura en `/share/boards/[token]`.
- Tabla `visual_board_collaborators` para colaboradores directos.
- Invitación por email como registro de acceso preparado para siguientes fases.
- Indicador de colaboradores en topbar.
- RLS ampliado para owner, organización, colaboradores y public links.

## No incluye todavía
- Edición pública real.
- Cursores realtime.
- Presencia realtime.
- Emails transaccionales de invitación.

## QA
Validar crear enlace, copiar enlace, abrirlo en navegación pública, agregar colaborador y confirmar que la pizarra sigue guardando autosave.
