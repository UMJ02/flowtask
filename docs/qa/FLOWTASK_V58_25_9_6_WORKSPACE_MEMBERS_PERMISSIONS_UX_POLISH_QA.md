# QA — v58.25.9.6 Workspace Members + Permissions UX Polish

## Casos a validar

1. Abrir `/app/workspace` como usuario dueño de proyecto.
2. Confirmar que Home muestra miembros y permisos activos.
3. Confirmar que Right Panel muestra equipo/permisos.
4. Guardar vista como owner/editor.
5. Renombrar vista como owner/editor.
6. Marcar vista default como owner/editor.
7. Crear espacio como usuario personal o admin/manager de organización.
8. Asignar proyecto a espacio como usuario con permiso.
9. Subir archivo como usuario con permiso.
10. Entrar con usuario viewer y confirmar modo solo lectura.
11. Confirmar que viewer no puede crear tareas.
12. Confirmar que viewer no puede guardar vistas.
13. Confirmar que viewer no puede gestionar espacios.
14. Confirmar que viewer no puede subir archivos.
15. Confirmar que Supabase/RLS sigue siendo la última capa de seguridad.

## Resultado esperado

La app debe mostrar permisos de forma clara, bloquear acciones de escritura para usuarios sin permiso y mantener lectura sin romper la experiencia Workspace.
