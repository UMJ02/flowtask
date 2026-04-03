# FlowTask V4 — Functional Validation

## Enfoque
Versión centrada en mejorar la validación funcional del flujo principal, reducir fricción UX y mantener contexto de navegación entre listado, detalle y edición.

## Cambios aplicados
- Preservación de filtros y query string en tareas: listado → detalle → edición → regreso.
- Preservación de filtros y query string en proyectos: listado → detalle → edición → regreso.
- Métricas rápidas visibles en listados de tareas y proyectos para dar contexto inmediato.
- Botones de cancelar agregados en formularios de tareas y proyectos.
- Flujo de registro mejorado para respetar `next` y no cortar el recorrido del usuario.
- Login ajustado para usar `router.replace()` y evitar historial innecesario.

## Beneficio funcional
Esta versión mejora el flujo real del usuario sin rehacer arquitectura: entrar, filtrar, abrir, editar, volver y continuar trabajando con menos pasos.
