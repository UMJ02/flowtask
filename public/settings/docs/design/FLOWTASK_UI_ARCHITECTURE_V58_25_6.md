# FlowTask UI Architecture — v58.25.6

## Principios

1. Una sola arquitectura visual para toda la app.
2. Cards compactas, sin nested cards pesadas.
3. Controles consistentes: input, select, textarea, checkbox, switch y range.
4. Botones con jerarquía clara: primary, secondary, ghost, danger.
5. Motion funcional únicamente: carga, feedback, selección, expansión y drag.
6. Texto legible, balanceado y sin desbordes.
7. Shadows y radius gobernados por tokens.

## Inspiración

- Apple: jerarquía visual, alineación, armonía y consistencia.
- Asana: foco, claridad, interacciones rápidas y estándar.
- Notion: interfaz liviana, contenido primero, controles discretos.

## Primitivas

```txt
ft-page-frame
ft-page-hero
ft-panel
ft-card
ft-subcard
ft-card-muted
ft-row
ft-list-row
ft-actionbar
ft-danger-zone
```

## Texto

```txt
ft-heading-page
ft-heading-section
ft-copy
ft-kicker
ft-text-main
ft-text-soft
ft-text-muted
ft-text-faint
```

## Controles

```txt
ft-input
ft-input-lg
ft-select
ft-textarea
ft-switch
ft-toggle
ft-chip
ft-chip-active
```

## Métricas

```txt
ft-metric-card
ft-metric-label
ft-metric-value
```

## Reglas

- Evitar nuevos `rounded-[...]` sin necesidad.
- Evitar shadows manuales por pantalla.
- Evitar `hover:-translate`.
- Todo formulario debe verse correcto aunque el componente use input/select nativo.
- Los selects deben tener estilo de app, no estilo del navegador.
- Los toggles deben usar `ft-switch` cuando representen on/off.
- Los checkboxes deben ser checks, no toggles.
