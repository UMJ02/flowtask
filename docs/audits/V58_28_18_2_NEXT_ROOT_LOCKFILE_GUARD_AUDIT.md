# Audit — v58.28.18.2 Next Root Lockfile Guard

## Problema observado
Next.js 15.5.18 puede advertir que detectó varios lockfiles y seleccionar un directorio padre como root del workspace.

## Solución aplicada
Se fija explícitamente:

```ts
outputFileTracingRoot: process.cwd()
```

en `next.config.ts`.

Esto evita depender de una limpieza manual fuera del proyecto para el build de FlowTask.
