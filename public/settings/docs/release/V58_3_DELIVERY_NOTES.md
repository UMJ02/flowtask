# V58.3 — Release hardening base

## Alcance
- limpiar la base de entrega sin tocar la lógica principal del sistema
- normalizar el contrato de variables de entorno
- alinear scripts y documentación con la línea viva V58.x
- dejar una base más segura para las siguientes iteraciones 1:1

## Cambios principales
- se agrega `.env.example`
- `validate-env.mjs` ahora carga `.env.local` y `.env`
- `verify:current` y `release:repo:current` quedan alineados con `v58.3`
- metadata de release actualizada a `58.3-release-hardening-base`
- documentación de release actualizada a V58.3
- bundle final limpio sin `.git`, `.env`, `.env.local`, `.next`, `node_modules`, `__MACOSX`, `.DS_Store` ni `tsconfig.tsbuildinfo`

## Resultado esperado
1. La base sigue funcional para continuar trabajo 1:1.
2. El repo queda más coherente para QA y entregas manuales.
3. El contrato de entorno deja de depender de archivos implícitos.
4. La línea de release queda alineada con la rama viva V58.x.
