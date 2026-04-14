# V58.11 — Workspace Polish and Invite Flow Fix

## Objetivo
Afinar la experiencia del módulo organización y del dashboard general, reduciendo ruido visual, haciendo los bloques desplegables más claros y corrigiendo el comportamiento del endpoint de invitaciones cuando el correo ya tenía una invitación pendiente.

## Cambios principales
- se elimina el card de inicio rápido del dashboard
- tabs de acceso e invitaciones con disclosure manual y contenido contraído por defecto
- bitácora con superficie más sobria y consistente
- copy del workspace más natural y menos técnico
- paneles de organización con paleta más neutral y coherente con la app
- el endpoint `POST /api/organization/invites` deja de responder 409 cuando ya existe una invitación pendiente; ahora responde OK e informa que la invitación sigue activa
- el formulario de invitaciones refresca la vista luego del envío correcto

## Resultado esperado
- experiencia más limpia y cercana al lenguaje visual del resto de FlowTask
- menos fricción al invitar personas
- organización más consistente con un estilo moderno y sobrio
