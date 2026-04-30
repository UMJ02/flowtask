# Flowtask v58.18 — Client Ready Onboarding + Demo Data

Base: v58.17.1b Real DB Contract Fix.

## Objetivo
Convertir la base estable en una experiencia lista para usuario nuevo, sin tocar datos reales ni agregar migraciones agresivas.

## Incluye
- Onboarding separado por modo: cuenta personal vs organización seleccionada.
- Demo data inteligente y segura.
- Inserción de datos de ejemplo solo si el workspace activo tiene 0 proyectos y 0 tareas.
- Para personal: 1 proyecto demo + 3 tareas + checklist inicial.
- Para organización: 1 cliente demo + 1 proyecto demo + 3 tareas + checklist inicial.
- Protección explícita: usuarios existentes no reciben datos demo automáticamente.
- Mensajes de cliente final, menos técnicos.

## No incluye
- Cambios de pricing definitivo.
- Cobros o pasarela de pago.
- Migraciones de estructura.
- Cambios en el gate de Vercel.

## Seguridad de datos
La acción `createOnboardingDemoData` valida conteos con `applyWorkspaceScope` antes de insertar. Si detecta proyectos o tareas existentes, no crea ejemplos.
