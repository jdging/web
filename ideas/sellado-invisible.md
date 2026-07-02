# Sellado invisible — marcar texto auto-estampado para poder re-estamparlo

- **Origen:** area-viva (DEC-052, auto-relleno de presentaciones en Google Slides), 2026-05
- **Qué resuelve:** cuando un sistema estampa valores (proyecto, cliente, fecha, revisión) en
  un documento que el usuario después edita libremente, ¿cómo actualizás SOLO lo estampado sin
  corromper texto del usuario que casualmente contiene el mismo valor?
- **Cuándo aplica:** generación de documentos con tokens `{{...}}` que luego se re-generan en
  revisiones (Slides, Docs, HTML editable). NO aplica si el documento es de solo lectura
  (ahí re-renderizás todo y listo).

## La idea

Al estampar cada valor, se le antepone un **caracter invisible (ancla)** — y **distinto por
campo** (ej. U+200B para fecha/revisión, U+2061 proyecto, U+2062 cliente, U+2063 dirección).
El re-estampado busca y reemplaza **siempre el string sellado completo (ancla + valor viejo)**,
nunca el valor pelado.

Reglas duras aprendidas:
- **NUNCA reemplazar por valor pelado ni por dígitos sueltos** — corrompería medidas o textos
  del usuario que contengan "1", "2" o el nombre del cliente.
- **Un ancla POR CAMPO, no una compartida:** el "ancla sola" de un campo vacío colisionaría
  como substring con las de los otros campos.
- El ancla la antepone SIEMPRE el mismo lado (en area-viva, el backend); el frontend maneja
  valores limpios + los sellos viejos releídos de la fuente fresca.
- Tener fallbacks anotados por si el renderer "come" algún caracter (U+2060, U+FEFF).

## Cómo llevarla a un proyecto

1. Elegir un caracter invisible por campo estampable y documentar la tabla campo→ancla.
2. Centralizar el sellado en UNA función (`sellar(texto, campo)`) del lado que escribe.
3. El re-estampado: leer los sellos vigentes de la fuente de verdad → reemplazar
   `ancla+valorViejo` → `ancla+valorNuevo` → persistir los sellos nuevos.
4. QA obligatorio: un documento donde el usuario escribió a mano el mismo valor estampado
   (no debe tocarse) y un campo vacío (no debe colisionar).

## Referencia de origen

`area-viva/CLAUDE.md` (alerta "Slides auto-relleno/re-estampado", DEC-052) y las funciones
`sellarTextoSlides_` / `sellarConHandle_` en los Apps Script de area-viva.
