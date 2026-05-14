# QA — FlowTask v58.26.4 Workspace Collaboration + Share + Mobile Polish

## Checklist funcional

- Abrir `/app/workspace`.
- Presionar `Compartir` desde header desktop.
- Presionar `Compartir` desde toolbar mobile.
- Copiar link de Workspace Home.
- Copiar link de proyecto activo.
- Copiar link de vista actual.
- Abrir una vista guardada y copiar su link.
- Confirmar que miembros y roles se muestran correctamente.
- Confirmar que usuarios sin permisos ven explicación clara.
- Confirmar que el panel se cierra con fondo/overlay o botón `X`.

## Checklist responsive

- Validar panel en desktop.
- Validar panel en tablet.
- Validar panel en mobile.
- Confirmar que los botones de copia no se desbordan.
- Confirmar que nombres largos de miembros/proyectos/vistas hacen truncate.

## Checklist seguridad UX

- Confirmar que los links son internos.
- Confirmar que el panel aclara que los links no saltan RLS.
- Confirmar que gestión de acceso queda bloqueada cuando `canManageMembers` es false.
- Confirmar que compartir limitado se comunica sin mostrar error crudo.
