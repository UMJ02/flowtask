# QA — v58.21.3 Design System Foundation + Visual Consistency

## Objetivo

Validar que FlowTask use una escala visual más consistente en textos, cards, botones, inputs, chips y estados principales.

## Rutas principales

- `/app/dashboard`
- `/app/tasks`
- `/app/tasks/new`
- `/app/tasks/[id]`
- `/app/projects`
- `/app/projects/new`
- `/app/projects/[id]`
- `/app/projects/[id]?mode=edit`
- `/app/clients`
- `/app/organization`
- `/login`
- `/register`

## Checklist visual

1. Los títulos principales no deben sentirse gigantes o demasiado pesados.
2. Los subtítulos deben guiar al usuario sin competir con el título.
3. Los botones primarios deben tener altura consistente y buena área de toque.
4. Los botones secundarios no deben verse más importantes que los primarios.
5. Los inputs/selects/textareas deben compartir radio, altura y focus visual.
6. Las cards principales deben sentirse parte del mismo sistema.
7. Los chips de estado deben mantener tamaño y peso similares.
8. La app debe mantener buen contraste y legibilidad.
9. No deben aparecer nuevos desbordes por los cambios visuales.
10. El flujo de crear tarea/proyecto y editar proyecto inline debe seguir funcionando.

## Validación técnica

```bash
npm run verify:v58.21.3
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
