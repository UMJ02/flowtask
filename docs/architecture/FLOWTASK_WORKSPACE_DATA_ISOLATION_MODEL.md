# FlowTask — Workspace Data Isolation Model

## Regla base

El usuario individual es la identidad principal. Ese mismo usuario puede trabajar en su espacio personal o crear organizaciones. Una organización no reemplaza al usuario; funciona como un workspace separado.

## Workspace personal

```txt
organization_id = null
owner_id / account_owner_id / user_id = auth.uid()
```

Ejemplos:

- `projects.organization_id is null`
- `tasks.organization_id is null`
- `clients.organization_id is null`
- `visual_boards.organization_id is null`

## Workspace organización

```txt
organization_id = organizations.id
usuario debe existir en organization_members
```

El creador queda como `admin_global`.

## Regla de no mezcla

Un proyecto de organización no debe contener tareas personales. Un proyecto personal no debe contener tareas de organización.

```txt
tasks.project_id -> projects.id
tasks.organization_id must be not distinct from projects.organization_id
```

## Migración personal → organización

La migración debe ser explícita. No se debe mover data de forma automática al cambiar de workspace.

Función agregada:

```sql
public.move_personal_project_to_organization(project_id, organization_id)
```

Mueve el proyecto y sus tareas directas al workspace de organización.

## Ciclo de vida de una organización

### Activa

```txt
deleted_at = null
purge_after = null
```

### Eliminación programada

```txt
deleted_at = now()
purge_scheduled_at = now() + retention
purge_after = now() + retention
```

La organización puede restaurarse antes de `purge_after`.

### Restaurada

```txt
deleted_at = null
purge_scheduled_at = null
purge_after = null
reactivated_at = now()
```

### Purga definitiva

La purga elimina registros por orden controlado y evita depender de `ON DELETE SET NULL` en `projects` y `tasks`.

Función agregada:

```sql
public.purge_organization_data(organization_id, force)
```

## Nota sobre Storage

La purga elimina filas de `attachments`, pero la eliminación física de objetos de Storage puede requerir un job o función adicional si los buckets no están totalmente gobernados por triggers.
