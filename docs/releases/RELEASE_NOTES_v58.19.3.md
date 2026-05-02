# Flowtask v58.19.3 — Native Dots Transition Loader

Base: `v58.19.2 Project Structure Cleanup`

## Objetivo
Reemplazar la transición basada en video/Lottie por una animación nativa, ligera y estable, sin depender de archivos externos ni assets de video para las cargas públicas y de workspace.

## Cambios incluidos

1. **Nuevo loader nativo de puntos**
   - Se agregó `src/components/ui/native-dots-loader.tsx`.
   - La animación usa solo React + CSS.
   - No usa Lottie, `.webm`, `.mp4` ni URLs externas.

2. **Overlay premium actualizado**
   - `src/components/ui/auth-premium-loader.tsx` ahora renderiza la animación de 4 puntos azules.
   - Se mantiene el fondo fullscreen blanco/mint con blur suave.
   - Se elimina el card/cuadro anterior y cualquier dependencia visual de video.

3. **Keyframes CSS**
   - Se agregaron estilos en `src/app/globals.css`:
     - `.flowtask-loading-dot`
     - `@keyframes flowtask-native-dot-loader`
   - Incluye soporte para `prefers-reduced-motion`.

4. **Limpieza de assets antiguos**
   - Se eliminó `public/animations/` porque ya no se usa la animación de video local.

## Pantallas impactadas

- Intro / inicio público: `Cargando inicio…`
- Login: `Cargando ingreso…`
- Register: `Cargando registro…`
- Workspace: `Cargando workspace…`

## Archivos modificados

- `src/components/ui/auth-premium-loader.tsx`
- `src/components/ui/native-dots-loader.tsx`
- `src/app/globals.css`
- `docs/releases/RELEASE_NOTES_v58.19.3.md`

## Validación realizada

- Se confirmó que el loader ya no usa:
  - Lottie
  - video local
  - archivos en `public/animations/`
  - URLs externas
- Se verificó que no quedan referencias activas a `flowtask-loading.webm`, `flowtask-loading.mp4` o `DotLottie` fuera del historial de release notes.

## Validación recomendada en local

```bash
rm -rf node_modules .next tsconfig.tsbuildinfo
npm ci
npm run typecheck
npm run build
```

> Nota: usar Node 20.x, según `package.json`.
