# QA — v58.27.5 Workspace Pro Files + Reports CRUD Polish

Validar:
1. `/app/workspace?view=files` carga sin romper.
2. Subir archivo respeta permisos y proyecto activo.
3. Abrir/descargar archivo funciona cuando public_url existe.
4. Renombrar archivo actualiza `attachments.file_name`.
5. Eliminar archivo elimina row y storage path cuando existe.
6. `/app/workspace?view=reports` permite elegir rango y proyecto.
7. Accesos a reportes completos e imprimibles funcionan.
8. `npm run workspace:files-reports:ready` pasa.
9. `npm run typecheck` y `npm run build` pasan en entorno local.
