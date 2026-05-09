# QA — v58.23.4 Board Sharing + Collaboration Layer

1. Aplicar migración `0047_v58_23_4_board_sharing_collaboration.sql`.
2. Abrir `/app/boards`.
3. Abrir una pizarra.
4. Click en Compartir.
5. Activar Enlace público.
6. Copiar enlace.
7. Abrir `/share/boards/[token]` en otra pestaña.
8. Confirmar que la pizarra carga en modo solo lectura.
9. Agregar un colaborador por email.
10. Confirmar que aparece en la lista.
11. Cambiar el título de la pizarra y validar autosave.
12. Desactivar enlace público y confirmar que el link deja de estar disponible.
