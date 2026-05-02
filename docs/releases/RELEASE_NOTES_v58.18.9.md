# Flowtask v58.18.9 — Public transitions, workspace filters and checklist progress sync

Base: v58.18.8 Premium Loaders.

## Cambios incluidos

1. Intro/login/register usan transición premium de 3.4 s para que el loader minimal pueda verse de forma fluida.
2. El loader usa el logo real de `public/icons/icon.png` en lugar del placeholder geométrico.
3. La intro elimina los botones superiores de `Iniciar sesión` y `Crear cuenta gratis`; se conserva el logo y los CTA principales del hero.
4. En `Mi flujo de trabajo`, el botón `Filtros` abre un panel sutil con búsqueda, estado, prioridad y limpiar filtros.
5. En `Mi flujo de trabajo`, `Agrupar` ahora alterna entre Estado, Prioridad y Registro, aplicando orden visual sin romper el kanban.
6. En edición de tarea, `Progreso operativo` ya no inicia en 25% por estado. Se sincroniza con checklist: sin checklist inicia en 0%.
7. En edición de tarea, se agrega recordatorio UX en color ámbar para crear checklist cuando la tarea no tiene puntos de seguimiento.

## Validación realizada

- `npm run build` no pudo completarse porque el entorno local no tiene variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `npm run typecheck` requiere dependencias instaladas; si no existen, correr `npm install` o `npm ci` antes.

## Validación recomendada

```bash
rm -rf node_modules .next
npm ci
npm run typecheck
npm run build
```
