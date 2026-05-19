# FlowTask v58.28.21.2 — Classic Project Edit Form Alignment QA

Validar `/app/projects/[id]?mode=edit`:

- La edición mantiene el contenido inferior de la vista sin cambios estructurales.
- La imagen del proyecto aparece a la izquierda y muestra controles sobre la imagen: `Cambiar imagen` y `Quitar`.
- Nombre, fecha de creación y descripción quedan agrupados a la derecha de la imagen.
- Estado, Departamento, Registro, País, Fecha límite y Proyecto colaborativo quedan dentro de una grilla compacta de campos.
- No aparece el hueco central grande que quedaba al entrar en modo edición.
- Cancelar y Guardar están visibles arriba y no compiten con el contenido inferior.
- En mobile el form se apila sin overflow horizontal.
