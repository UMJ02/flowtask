# Archivos requeridos por deploy

Este proyecto necesita estos archivos versionados en Git:

- `.nvmrc` en la raíz
- `.env.example` en la raíz
- `.github/workflows/ci.yml` dentro de `.github/workflows/`

Si faltan, `verify:current` y el preflight de Vercel fallan antes del build de Next.
