# FlowTask v7.6.2 - Hydration + Manifest fix

## Cambios
- Se evitó el hydration mismatch en la pizarra renderizando una salida estable antes del mount del cliente.
- Se volvió determinístico el formateo de fechas cortas del kanban para evitar diferencias entre server y client.
- El kanban ya no lee localStorage durante el render inicial del servidor; ahora sincroniza después de hidratar.
- El manifest PWA se publica solo en development o Vercel production, no en previews.
- El registro PWA se desactiva en dominios preview de Vercel para evitar ruido de service worker y manifest 401.

## Objetivo
Reducir el error React #418 por desajuste de hidratación y limpiar el error 401 del manifest en previews de Vercel.
