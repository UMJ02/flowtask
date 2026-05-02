# Flowtask v58.19.2 — Repository Documentation Cleanup

Base: `Flowtask v58.19.1 Lottie Transition Overlay`.

## Cambios aplicados

1. Se ordenaron los release notes que estaban sueltos en la raíz del proyecto.
2. Los `RELEASE_NOTES_*.md` ahora viven en `docs/releases/`.
3. El documento de ubicación de archivos requeridos para deploy ahora vive en `docs/deployment/REQUIRED_DEPLOY_FILES_LOCATION.md`.
4. Se actualizaron scripts antiguos que apuntaban al archivo de deploy en raíz para que usen la nueva ruta.
5. El audit JSON de producto se movió a `docs/audits/product-connection-audit.json`.
6. El script `scripts/audit/product-connection-audit.mjs` ahora genera su salida dentro de `docs/audits/`.
7. Se eliminó `tsconfig.tsbuildinfo` del paquete final por ser artefacto local de compilación.
8. Se conserva `README.md` en raíz porque es documentación principal esperada por GitHub/Vercel/equipo.

## Criterio de orden

La raíz queda reservada para archivos de configuración, manifiestos del proyecto y `README.md`. La documentación operativa y de versiones queda dentro de `docs/`.

## Validación recomendada

```bash
rm -rf node_modules .next tsconfig.tsbuildinfo
npm ci
npm run typecheck
npm run build
```

Usar Node 20.x.
