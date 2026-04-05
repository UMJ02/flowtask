# Archivos requeridos por deploy

Este proyecto necesita estos archivos versionados en Git:

- `.nvmrc` en la raíz
- `.env.example` en la raíz

` .github/workflows/ci.yml ` ya no es obligatorio para `verify:current` ni para el preflight de Vercel en V58.10.3+; si existe puede convivir, pero no se exige para deploy.
