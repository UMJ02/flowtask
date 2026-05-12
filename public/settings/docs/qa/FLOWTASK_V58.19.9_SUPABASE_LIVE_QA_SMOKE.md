# FlowTask v58.19.9 — Smoke Supabase Live QA / Vercel / organizaciones

Usar este checklist antes de entregar a usuario final. Requiere `.env.local` real con Supabase y la app corriendo local o en preview Vercel.

## 1. Preflight técnico

```bash
npm run validate:env
npm run runtime:check
npm run doctor:supabase
npm run verify:v58.19.9
npm run typecheck
npm run build:preflight
npm run build
```

Resultado esperado: todos los comandos pasan. `npm run dev` debe quedar abierto mostrando `Ready`.

## 2. Registro y login

1. Registrar un usuario nuevo.
2. Confirmar correo.
3. Verificar que la confirmación no mande directo al dashboard.
4. Verificar redirección a login.
5. Iniciar sesión.
6. Verificar dashboard personal.
7. Probar errores de login/register y confirmar que desaparecen al corregir campos.
8. Probar rate limit de Supabase si aplica y confirmar mensaje de espera/cooldown.

## 3. Cuenta personal

1. En workspace personal crear una tarea.
2. Crear proyecto personal.
3. Crear cliente/registro personal si aplica.
4. Validar dashboard, tareas, proyectos, analítica y registros.
5. Confirmar que `organization_id` queda `null` en datos personales.

## 4. Organización

1. Crear organización desde el mismo usuario individual.
2. Cambiar explícitamente al workspace de organización.
3. Confirmar que no aparecen tareas/proyectos/clientes personales.
4. Crear tarea de organización.
5. Crear proyecto de organización.
6. Crear cliente/registro de organización si aplica.
7. Confirmar que las métricas del dashboard cambian al scope de organización.
8. Confirmar que el header/switch muestra organización activa.

## 5. Aislamiento personal ↔ organización

1. Volver a workspace personal.
2. Confirmar que no aparecen datos creados en organización.
3. Volver a organización.
4. Confirmar que no aparecen datos personales.
5. Recargar navegador en ambos scopes y confirmar que no hay datos mezclados.

## 6. Invitaciones y permisos

1. Invitar un miembro.
2. Confirmar que no hay error 409 inesperado.
3. Aceptar invitación con otro usuario.
4. Validar permisos básicos.
5. Validar que miembro no admin no puede eliminar la organización.

## 7. Eliminación / reactivación de organización

1. Programar eliminación de organización.
2. Confirmar que la app vuelve a personal.
3. Confirmar que la organización no queda activa en el switch principal.
4. Reactivar organización desde la bandeja/recovery disponible.
5. Confirmar que vuelve sin mezclar datos.
6. Probar eliminación permanente solo en una organización de prueba.

## 8. Analítica, landing pública y Excel

1. Abrir analítica.
2. Usar Exportar datos reales.
3. Confirmar descarga `.xlsx`.
4. Abrir Excel y validar hojas: `Reporte`, `Tareas exportadas`, `Resumen`, `Diccionario`.
5. Confirmar formato, filtros y encabezados.
6. Abrir landing pública.
7. Confirmar botones al final: compartir, PDF, exportar, FlowTask.
8. Confirmar que no aparece el panel lateral de resumen.

## Criterio de aprobación

Aprobar para usuario final solo si no hay mezcla de datos entre personal y organización, Supabase live responde correctamente, build pasa y el Excel/landing funcionan en un navegador real.


## Vercel build smoke

Ejecutar en Vercel o local:

```bash
npm run vercel:build
```

`verify:current` no debe fallar por `node_modules`, `.env`, `.env.local` o `.next` durante el build.

Para auditar un ZIP limpio:

```bash
FLOWTASK_VERIFY_RELEASE_PACKAGE=1 npm run verify:v58.19.9
```
