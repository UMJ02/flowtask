# Flowtask V8 — Release Candidate Full

## Objetivo
Llevar la base a una etapa más cercana a entrega cliente con control de salida, checklist de release y endurecimiento del flujo principal.

## Cambios aplicados
- Script nuevo de control de salida:
  - `npm run release:check`
  - `npm run release:bundle`
- Verificación estructural de archivos críticos del core.
- Verificación de cobertura mínima del contrato de `.env.example`.
- Definición de gates manuales de release:
  - autenticación
  - dashboard
  - tareas
  - proyectos
  - notificaciones
  - endpoints de salud
  - revisión móvil
  - build
- Documentación de release candidate incorporada al proyecto.

## Resultado
La versión queda mejor preparada para:
- revisión interna
- demo cliente
- QA local más ordenado
- preparación de despliegue

## Nota honesta
Esta versión agrega hardening documental y scripts de control de salida. No suplanta una ejecución completa remota de QA contra tu infraestructura, pero sí deja la base lista para cierre serio.
