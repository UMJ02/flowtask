# v58.21.7 — Style Cascade Reset + Interaction Polish

## Base

v58.21.6 — Visual Rhythm + Legacy Style Cleanup.

## Objetivo

Eliminar competencia de estilos, limpiar la cascada visual y reforzar microinteracciones modernas sin cambiar Supabase, RLS ni lógica de negocio.

## Cambios

- `globals.css` reorganizado en una cascada única.
- Eliminadas definiciones duplicadas de utilidades `ft-*`.
- Eliminado el override global de sombras.
- Sombras convertidas en variantes nombradas: `ft-floating-card` y `ft-overlay-card`.
- Auth screens compactadas y sin sombras pesadas.
- Heroes premium reducidos a superficies border-first.
- Landing mantiene acentos glow suaves como excepción documentada.
- Motion más intencional para reveal, slide/fade y expand.
- Reglas de mantenimiento documentadas en `FLOWTASK_STYLE_CASCADE.md`.

## Sin cambios

- Sin migraciones Supabase.
- Sin cambios de RLS.
- Sin cambios de payloads.
- Sin cambios de autenticación.
