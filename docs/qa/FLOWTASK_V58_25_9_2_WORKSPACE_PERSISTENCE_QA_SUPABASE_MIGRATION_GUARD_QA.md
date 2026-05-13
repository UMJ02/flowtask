# QA — FlowTask v58.25.9.2 Workspace Persistence QA + Supabase Migration Guard

## CLI

```bash
cd ~/Documents/"Web Projects"/flowtask
nvm use 20
npm install
npm run workspace:doctor
npm run verify:current
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```

## Supabase QA

### 1. Validar migración 0056

```sql
select
  to_regclass('public.workspace_spaces') as workspace_spaces,
  to_regclass('public.project_views') as project_views;
```

Debe devolver ambas tablas cuando la migración esté aplicada.

### 2. Validar policies

```sql
select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('workspace_spaces','project_views')
order by tablename, policyname;
```

Deben existir policies de select/write para ambas tablas.

## App QA

### Caso A — Migración aplicada

- Abrir `/app/workspace`.
- Seleccionar proyecto real.
- Abrir “Vistas guardadas”.
- Guardar vista activa.
- Renombrar vista.
- Marcar como default.
- Abrir vista guardada.
- Eliminar vista.

Resultado esperado: operaciones correctas y feedback inline.

### Caso B — Migración no aplicada

- Abrir `/app/workspace` antes de aplicar 0056.
- Confirmar que la página carga.
- Confirmar que espacios generados siguen visibles.
- Abrir “Vistas guardadas”.
- Confirmar que el guard bloquea guardado y explica que falta migración.

Resultado esperado: no hay crash, no hay pantalla blanca, no hay alert nativo.

### Caso C — Proyecto inválido

- Abrir `/app/workspace?projectId=uuid-invalido`.

Resultado esperado: mensaje de protección y cero mezcla de datos.

### Caso D — Organización

- Cambiar a organización.
- Abrir `/app/workspace`.
- Confirmar workspaceName de organización.
- Confirmar que no se mezclan datos personales.

### Caso E — Estados vacíos

Validar:

- Sin proyectos.
- Sin tareas.
- Sin archivos.
- Sin actividad.
- Sin vistas guardadas.

Resultado esperado: estados vacíos profesionales y acciones claras.

## Checklist aceptación

- [ ] `npm run workspace:doctor` pasa.
- [ ] `npm run verify:current` apunta a v58.25.9.2.
- [ ] `typecheck` pasa.
- [ ] `build:preflight` pasa con `.env` real.
- [ ] `/app/workspace` carga aunque 0056 no esté aplicada.
- [ ] Saved Views se bloquea si `project_views` no existe.
- [ ] Saved Views funciona si `project_views` existe.
- [ ] Right Panel muestra estado de persistencia.
- [ ] No se rompieron `/app/tasks`, `/app/projects`, `/app/boards`, `/app/reports`.
