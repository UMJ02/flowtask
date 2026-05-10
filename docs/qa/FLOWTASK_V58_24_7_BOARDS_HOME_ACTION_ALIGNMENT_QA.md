# QA — v58.24.7 Boards Home Action Alignment

## Base

`v58.24.6 — Boards Home UI Redesign + Saved Board Delete`

## Rutas a validar

- `/app/boards`
- `/app/boards/[boardId]`
- `/share/boards/[token]` si existe una pizarra compartida

## Checklist funcional

- [ ] El hero muestra `Nueva pizarra` y `Ver plantillas`.
- [ ] No aparece el botón `Importar`.
- [ ] `Nueva pizarra` crea un lienzo en blanco y navega al editor.
- [ ] `Ver plantillas` desplaza correctamente hacia el bloque de plantillas.
- [ ] `Ver todas las plantillas` despliega la plantilla adicional.
- [ ] `Ver menos plantillas` vuelve al estado compacto.
- [ ] `Actualizar` recarga la lista de pizarras recientes sin romper el estado visual.
- [ ] Las cards recientes no muestran avatares simulados.
- [ ] Las cards muestran badge real: `Privada`, `Compartida`, `Enlace activo` o `Enlace editable`.
- [ ] `Quitar` abre modal de confirmación.
- [ ] El modal no dice `Acción irreversible`.
- [ ] Confirmar `Quitar` aplica soft delete con `deleted_at`.
- [ ] La pizarra desaparece de la lista después de confirmar.
- [ ] Cancelar/cerrar modal no cambia datos.

## Checklist visual

- [ ] Hero mantiene composición premium de v58.24.6.
- [ ] Botones tienen alturas consistentes.
- [ ] Plantillas no se desbordan en desktop/tablet/mobile.
- [ ] Cards recientes siguen usando preview o thumbnail si existe.
- [ ] Badge de acceso no rompe la card en nombres largos.
- [ ] Botón `Quitar` no se monta sobre el badge.
- [ ] Mobile se apila sin scroll horizontal roto.

## No debe cambiar

- [ ] No tocar migraciones Supabase.
- [ ] No cambiar RLS.
- [ ] No cambiar bucket `visual-board-files`.
- [ ] No cambiar Realtime.
- [ ] No rediseñar el editor `/app/boards/[boardId]`.
- [ ] No agregar importación real todavía.
- [ ] No implementar `Compartidas conmigo` todavía.
