# v58.28.21.4 — Share Landing Short Link + Stored Report Tokens

Esta versión reemplaza los enlaces largos con `data=` por enlaces cortos basados en token almacenado en Supabase.

## Cambios
- Nueva tabla `shared_reports`.
- Nuevo endpoint `POST /api/share/reports`.
- Nueva ruta pública `/share/[token]` con lectura desde Supabase.
- Fallback compatible para `/share?data=...`.
- Share Center ahora copia links cortos `/share/rpt_...`.
