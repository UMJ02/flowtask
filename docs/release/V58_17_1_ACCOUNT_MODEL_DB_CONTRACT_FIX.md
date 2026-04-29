# Flowtask v58.17.1 — Account Model & DB Contract Fix

## Objetivo

Esta versión corrige la base conceptual antes de avanzar a Client Ready:

- El usuario individual es siempre la identidad principal.
- El workspace personal existe por defecto.
- Las organizaciones son espacios creados por usuarios individuales.
- Una organización no es un usuario.
- El creador de una organización queda como `admin_global`.
- Los planes comerciales siguen como provisionales; no se fijan nombres finales.

## Cambios incluidos

### 1. Workspace activo más seguro

Antes, si el usuario tenía membresías y no había cookie explícita, el sistema podía caer automáticamente en la primera organización disponible.

Ahora:

- sin preferencia explícita = workspace personal;
- `personal` = workspace personal;
- organización = solo si el usuario eligió esa organización y tiene membresía válida.

Archivos:

- `src/lib/security/organization-access.ts`
- `src/lib/queries/organization.ts`

### 2. Onboarding alineado al modelo real

El onboarding ya no castiga al usuario por no tener organización activa.

Ahora reconoce:

- modo personal como punto de partida válido;
- organización como capa opcional para equipo/clientes/permisos;
- recomendaciones diferenciadas.

Archivo:

- `src/lib/queries/onboarding.ts`

### 3. Contrato de cuenta centralizado

Nuevo archivo:

- `src/lib/account/account-model.ts`

Define explícitamente:

- identidad principal = usuario individual;
- organización como workspace;
- creador = admin;
- organización como usuario = falso.

### 4. Contrato TypeScript de BD

Se reemplazó `Tables: Record<string, never>` por un contrato parcial real para las tablas críticas detectadas en la BD:

- profiles
- organizations
- organization_members
- organization_invites
- organization_subscriptions
- activation_codes
- tasks
- projects
- clients
- countries
- departments
- task_checklist_items

Archivo:

- `src/types/database.ts`

Esto reduce el riesgo de volver a usar columnas inexistentes como `country_id` o `is_done`.

### 5. Migración Supabase

Nueva migración:

- `supabase/migrations/0042_v58_17_1_account_model_db_contract_fix.sql`

Incluye:

- comentarios de contrato en tablas/columnas clave;
- trigger para asegurar membership de owner;
- función de reparación de owners sin membership;
- bootstrap de organización con plan interno neutral `team_trial`.

### 6. Verificación

Nuevo script:

- `scripts/verify-v58.17.1.mjs`

`package.json` ahora apunta `verify:current` a `verify:v58.17.1`.

## Nota importante

Esta versión NO cierra pricing comercial final. Los nombres Free / Work / Partner quedan como exploración futura.

## Siguiente paso recomendado

Después de aplicar esta versión y correr la migración, seguir con:

`v58.17.2 — Workspace QA & Stability Lock`

Antes de crear `v58.18 Client Ready`.
