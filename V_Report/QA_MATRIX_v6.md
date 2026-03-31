# QA Matrix v6

| Área | Caso | Resultado esperado |
|---|---|---|
| Auth | Login válido | Redirección correcta a app |
| Auth | Registro | Manejo correcto con o sin confirmación email |
| Auth | Recuperación | Flujo visible y sin ruptura |
| Dashboard | Primera carga | Render estable con/sin datos |
| Tasks | Crear tarea | Persistencia y navegación a detalle |
| Tasks | Editar tarea | Guardado sin perder contexto |
| Tasks | Filtros | Conservación de filtros entre navegación |
| Projects | Crear proyecto | Persistencia y navegación a detalle |
| Projects | Editar proyecto | Guardado correcto |
| Notifications | Carga | Vista estable sin error runtime |
| API | `/api/health` | Respuesta 200 |
| API | `/api/ready` | Respuesta 200 |
