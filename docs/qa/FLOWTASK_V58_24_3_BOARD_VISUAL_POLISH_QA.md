# QA v58.24.3 — Board Visual Polish

Ruta principal:

```txt
/app/boards/[boardId]
```

## Validaciones visuales

1. La toolbar expandida debe parecerse a la referencia: blanca, limpia, con icono + texto y sin botones tipo card pesada.
2. El activo debe verse en verde pastel.
3. La toolbar colapsada debe mostrar solo iconos.
4. El botón flotante para reabrir toolbar debe verse premium.
5. Los popovers de Forma y Más deben verse como paneles FlowTask.
6. El modal Limpiar pizarra no debe mostrar botones nativos.
7. El botón Borrar todo debe ser destructivo sólido.
8. El botón Cancelar debe ser secundario.
9. Los controles del panel de propiedades deben mantener estilo consistente.

## Validaciones funcionales

1. Mover toolbar.
2. Contraer toolbar.
3. Ocultar toolbar y volver a abrirla.
4. Abrir Más.
5. Abrir Forma.
6. Abrir Limpiar pizarra.
7. Cancelar no borra.
8. Borrar todo limpia los elementos.
9. Autosave y realtime siguen funcionando.
