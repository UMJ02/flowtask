# FlowTask Data Sync Reliability

## Regla de oro

Ninguna acción crítica debe marcarse como guardada hasta que Supabase confirme la fila afectada.

## Patrón correcto para update de una fila

```ts
const { data, error } = await supabase
  .from("tasks")
  .update(payload)
  .eq("id", taskId)
  .select("id,updated_at")
  .maybeSingle();

if (error || !data) {
  // mostrar error y no marcar como guardado
}
```

## Patrón correcto para delete

```ts
const { data, error } = await supabase
  .from("tasks")
  .delete()
  .eq("id", taskId)
  .select("id");

if (error || !data || data.length === 0) {
  // revertir UI o mostrar error
}
```

## Preferencias locales

Estas preferencias son locales por navegador y no se consideran datos persistidos en Supabase:

- columnas visibles del workspace
- orden visual local del tablero cuando no se persiste en board layout
- notas locales de workspace si aplica

## Datos persistidos en Supabase

- tareas
- proyectos
- adjuntos
- comentarios
- actividad
- checklist
- asignaciones
