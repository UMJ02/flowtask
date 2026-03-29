# FlowTask v7.1.0 — Vercel Hardening v2

Base saneada para continuar el proyecto sin arrastrar artefactos locales ni exponer secretos, pensando en estabilidad para Vercel + Supabase.

## Objetivo de esta versión
- usar una base limpia del proyecto para continuar 1:1
- evitar errores por artefactos locales (`node_modules`, `.next`, `.env.local`, `.git`)
- reforzar la validación mínima de runtime antes del build
- dejar una guía clara para instalación limpia, build y deploy en Vercel

## Stack
- Next.js 15
- React 19
- TypeScript
- Supabase (Auth + DB + RLS)
- TailwindCSS
- TanStack Query

## Scripts clave
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run typecheck`
- `npm run runtime:check`
- `npm run ci:check`
- `npm run clean`
- `npm run vercel:build`

## Variables requeridas
Deben existir al menos:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Server-side solamente:
- `SUPABASE_SERVICE_ROLE_KEY`

## Flujo recomendado para continuar
1. Instalar dependencias limpias:
   - `npm install`
2. Validar TypeScript:
   - `npm run typecheck`
3. Validar runtime:
   - `npm run runtime:check`
4. Validar build:
   - `npm run build`
5. Solo después empujar a Git/Vercel

## Estado honesto de esta base
- se eliminó del zip todo lo que no debe viajar
- se preservó la base de código para seguir iterando
- esta versión está pensada para reinstalar dependencias limpias antes de certificar build final
- no incluye `.env.local` por seguridad
- si el zip anterior expuso una service role key, debe rotarse en Supabase

## Checklist rápido para Vercel
- repo correcto conectado en Vercel
- variables de entorno cargadas en el proyecto correcto
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` realmente sea la anon key pública
- build validado localmente antes de push
- no subir `node_modules`, `.next`, `.env.local` ni secretos

## Notas
- La ruta `/app/intelligence` debe seguir siendo dinámica cuando depende de cookies autenticadas.
- Los scripts server-side que usan `SUPABASE_SERVICE_ROLE_KEY` deben ejecutarse solo del lado servidor.
