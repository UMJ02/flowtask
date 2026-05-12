# Flowtask v58.19.4 — Process Loading & Interaction Optimization

Base: `v58.19.3 Native Dots Transition Loader`

## Objetivo

Optimizar la percepción de velocidad y la interacción general sin cambiar la lógica de negocio, el modelo de datos ni el diseño visual aprobado.

## Cambios aplicados

### 1. Transiciones públicas más preparadas

Archivo:

- `src/components/public/public-transition-link.tsx`

Mejoras:

- Se agrega `router.prefetch(href)` al montar el enlace.
- Se vuelve a precargar en `pointerenter` y `focus`.
- Se centraliza la navegación en callbacks para evitar recreaciones innecesarias.
- Se mantiene el overlay de 2.5s con dots nativos, pero la ruta destino queda más preparada antes del cambio.

### 2. Loader nativo memoizado

Archivos:

- `src/components/ui/auth-premium-loader.tsx`
- `src/components/ui/native-dots-loader.tsx`

Mejoras:

- `AuthPremiumLoader` y `NativeDotsLoader` quedan memoizados.
- Evita renders innecesarios mientras la transición está activa.
- Se mantiene la animación nativa de 4 puntos sin archivos externos.

### 3. Workspace Home más fluido

Archivo:

- `src/components/workspace/workspace-home.tsx`

Mejoras:

- Se elimina un `createClient()` no utilizado.
- Se agrega `useDeferredValue` para que la búsqueda de “Mi flujo de trabajo” no bloquee la interacción al escribir.
- Se precargan rutas críticas del workspace:
  - `/app/tasks`
  - nueva tarea
  - lista de proyectos

### 4. Kanban interno con sincronización menos pesada

Archivo:

- `src/components/tasks/task-kanban-board.tsx`

Mejoras:

- El tablero aplica primero el layout local guardado para mostrar el estado rápido.
- La sincronización con layout remoto se retrasa levemente para no competir con el primer render.
- Se mantiene la persistencia de cambios, orden y estados.

### 5. Navegación interna sin recargas completas donde era posible

Archivos:

- `src/components/layout/organization-switcher.tsx`
- `src/components/layout/mobile-nav.tsx`
- `src/components/layout/user-menu.tsx`
- `src/components/organization/deleted-organizations-panel.tsx`
- `src/components/organization/organization-admin-settings-card.tsx`
- `src/components/organization/organization-pending-invites-card.tsx`

Mejoras:

- Se reemplazan recargas completas (`window.location.*`) por `router.replace()` + `router.refresh()` en flujos internos.
- Cambiar workspace, reactivar organización, aceptar invitación, salir/eliminar organización y cerrar sesión se sienten más integrados a Next.js.

### 6. Menor peso inicial en header/app shell

Archivo:

- `src/components/layout/app-header.tsx`

Mejoras:

- `CommandPalette` se carga con `next/dynamic`.
- El header muestra un placeholder liviano mientras se prepara el comando.
- Reduce trabajo inicial del header en pantallas internas.

### 7. Limpieza de residuos de loaders antiguos

Archivo:

- `src/app/globals.css`

Mejoras:

- Se eliminaron estilos residuales de `brand-loader dotlottie-player`, ya que la app usa loader nativo.

### 8. Configuración Next

Archivo:

- `next.config.ts`

Mejora:

- Se agrega `date-fns` a `optimizePackageImports` junto a `lucide-react`.

## Validación realizada

- Se limpió `node_modules`, `.next` y `tsconfig.tsbuildinfo` del paquete final.
- `runtime:check` se ejecutó y falló únicamente por variables locales faltantes:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- No se pudo completar `npm ci` dentro del entorno por timeout/SIGTERM y mismatch de Node local (`v22`) contra el engine del proyecto (`20.x`).

## Validación recomendada en máquina local

```bash
rm -rf node_modules .next tsconfig.tsbuildinfo
nvm use 20
npm ci
npm run typecheck
npm run build
```
