# Instructivo de diseño para planillas JDG

Este instructivo documenta las decisiones usadas en la planilla de presión dinámica de viento y sirve como base para futuras planillas de cálculo CIRSOC o herramientas técnicas similares.

La intención es que cada planilla se sienta como parte de la misma familia: sobria, técnica, compacta, con tema oscuro por defecto, exportación limpia y marca JDG siempre presente.

## Archivos de referencia

- `design/logoclaro.svg`: logo institucional original.
- `design/planillas-base.css`: estilos base reutilizables para nuevas planillas.

En el HTML final conviene incrustar los estilos, el logo y el estado guardado para que la planilla funcione como archivo standalone.

## Marca

Todas las planillas deben incluir el logo en el encabezado y el bloque de contacto al cierre.

Header obligatorio:

```html
<header class="app-header">
  <div class="header-main">
    <div class="brand-block" aria-label="JDG Sistemas y Estructuras">
      <img
        class="brand-logo"
        src="data:image/svg+xml;base64,..."
        alt="JDG Sistemas y Estructuras"
      />
      <div class="brand-tagline">Desarrollo de Estructuras & Sistemas</div>
    </div>
    <h1 class="app-title">
      Nombre de la planilla <small>norma / módulo</small>
    </h1>
  </div>
</header>
```

Footer obligatorio:

```html
<footer class="contact-footer" aria-label="Contacto">
  <div>
    <strong>Juan David Guzmán</strong>
    <small>Rosario, Argentina</small>
  </div>
  <div class="contact-links">
    <a href="mailto:ing.guzmanjuandavid@gmail.com"
      >ing.guzmanjuandavid@gmail.com</a
    >
    <a href="tel:+543413603215">(341) 360-3215</a>
    <a href="https://linkedin.com/in/ingjdg" target="_blank" rel="noopener"
      >linkedin.com/in/ingjdg</a
    >
    <a href="https://jdging.github.io/Portafolio" target="_blank" rel="noopener"
      >jdging.github.io/Portafolio</a
    >
  </div>
</footer>
```

Datos de contacto fijos:

- Nombre: Juan David Guzmán
- Ubicación: Rosario, Argentina
- Email: ing.guzmanjuandavid@gmail.com
- Teléfono: (341) 360-3215
- LinkedIn: linkedin.com/in/ingjdg
- Portfolio: jdging.github.io/Portafolio

## Logo incrustado

El logo siempre debe quedar incrustado en el HTML final. Durante desarrollo puede usarse `design/logoclaro.svg`, pero antes de entregar o guardar la planilla definitiva debe convertirse a `data:image/svg+xml;base64,...`.

Regla:

- En tema claro se usa el color original del SVG.
- En tema oscuro se usa el mismo SVG filtrado a blanco con CSS.

CSS:

```css
.brand-logo {
  width: clamp(132px, 15vw, 172px);
  max-height: 56px;
}

html.dark .brand-logo {
  filter: brightness(0) invert(1);
}
```

Script útil para incrustar el logo en un HTML que todavía use `src="design/logoclaro.svg"` o `src="logoclaro.svg"`:

```js
const fs = require("fs");

const htmlFile = "PLANILLA.html";
const logoFile = "design/logoclaro.svg";
const html = fs.readFileSync(htmlFile, "utf8");
const logoBase64 = fs.readFileSync(logoFile).toString("base64");
const dataUri = `data:image/svg+xml;base64,${logoBase64}`;

const updated = html.replace(
  /src="(?:design\/)?logoclaro\.svg"/,
  `src="${dataUri}"`,
);

fs.writeFileSync(htmlFile, updated, "utf8");
```

## Paleta

El azul institucional exacto del logo es:

```css
--brand-blue: #1e2348;
```

Ese azul se usa para marca, botones sólidos y elementos institucionales. Para acentos de lectura se usa una variante más visible:

```css
:root {
  --accent: #34468f;
  --accent-solid: #1e2348;
  --accent-soft: #eef1fa;
  --accent-line: #b7bfdc;
}

html.dark {
  --accent: #9eadea;
  --accent-solid: #1e2348;
  --accent-soft: #29325b;
  --accent-line: #4d5b8d;
}
```

Uso recomendado:

- `--brand-blue`: logo, identidad, botones principales.
- `--accent`: textos destacados, números de paso, links hover, chips activos y líneas finas de boxes/stats.
- `--accent-solid`: fondos sólidos de botones principales y usos institucionales grandes.
- `--accent-soft`: fondos suaves de chips, badges y resaltados.
- `--accent-line`: bordes internos o separadores con tono azulado.

Evitar volver a azules genéricos anteriores como `#4453c4`, `#8c98f0` o similares.

Para bordes izquierdos de cajas de resultado, especialmente ELU o valores principales como `qz ELU`, usar `--accent` y no `--accent-solid`. Las líneas finas necesitan un azul más claro para leerse bien en tema oscuro.

## Tema claro / oscuro

El tema oscuro es el predeterminado.

HTML recomendado:

```html
<html lang="es" class="dark"></html>
```

La planilla debe tener un botón de tema, pero si no existe estado guardado debe abrir siempre en oscuro.

Reglas:

- El tema claro debe verse limpio, de lectura técnica, con fondos grises muy suaves.
- El tema oscuro debe mantener contraste alto y no depender de azules demasiado oscuros para texto.
- No usar fondos decorativos, degradados hero, orbes ni elementos de landing page.
- La primera pantalla debe ser la herramienta, no una portada.

## Estructura estándar del HTML

Las planillas nuevas deben seguir siempre la misma organización interna. La idea es poder abrir, usar, guardar y compartir un solo archivo `.html`, sin depender de servidor ni de carpetas auxiliares.

Orden recomendado:

1. `<!doctype html>` y `<html lang="es" class="dark">`.
2. `<head>` con `meta charset`, `viewport`, `title` y un único bloque `<style>`.
3. `<body>` con `.wrap`.
4. Header de marca obligatorio.
5. Fórmula o resumen normativo principal.
6. Secciones numeradas de datos de entrada.
7. Secciones de coeficientes/intermedios.
8. Sección final de resultados.
9. Acciones: `Guardar`, `Exportar`, `Limpiar` si corresponde.
10. Footer de contacto obligatorio.
11. Un único bloque `<script>` al final del body.

Dentro del script mantener este orden:

1. Constantes y tablas normativas.
2. Bloque `SAVED_STATE` entre comentarios centinela.
3. Helpers generales (`$`, `fmt`, etc.).
4. Funciones de cálculo puras.
5. Funciones de renderizado.
6. Tema.
7. Estado y guardado standalone.
8. Exportaciones.
9. Carga inicial y event listeners.

Patrón obligatorio para estado incrustado:

```js
const SAVED_STATE = /*__STATE_START__*/ {
  theme: "dark",
}; /*__STATE_END__*/
```

El botón `Guardar` debe reescribir ese bloque dentro del propio HTML generado. Así cada planilla conserva sus valores al volver a abrirse.

## Estilo general del HTML

La interfaz debe sentirse como una herramienta técnica compacta:

- Ancho máximo aproximado: `1120px`.
- Bordes: `8px` o menos.
- Header sticky, sobrio y compacto.
- Secciones con título en mayúscula chica y separador horizontal.
- Paso numerado en badge pequeño.
- Cards simples, no cards dentro de cards.
- Controles visibles y directos: selects, inputs, switches, botones segmentados.
- Tablas de resultados densas, legibles y con números tabulares.
- Los boxes de resultado o resumen deben separar visualmente entrada y salida; usar `margin-top: 12px` cuando un resultado dinámico aparece inmediatamente debajo de inputs, como en el caso del factor `Kz`.
- Las líneas izquierdas de stats principales deben usar `var(--accent)` para que se distingan en ambos temas.
- Evitar textos explicativos largos dentro de la UI; usar hints breves cuando sean necesarios.

Estructura base:

```html
<div class="wrap">
  <header class="app-header">...</header>

  <div class="formula">...</div>

  <h2 class="section-title"><span class="step">1.</span>Datos</h2>
  <div class="card">...</div>

  <h2 class="section-title"><span class="step">2.</span>Resultados</h2>
  <div class="result-block">
    <table class="results-table">
      ...
    </table>
  </div>

  <footer class="contact-footer">...</footer>
</div>
```

## Exportación Word

Si la planilla exporta a Word, el resultado debe parecer una planilla prolija hecha en Excel y pegada en Word, no un informe pesado.

Reglas de contenido:

- Arrancar directamente con `Datos y coeficientes`.
- No incluir encabezado grande, logo ni fecha salvo que el usuario lo pida.
- Datos y coeficientes: usar tabla invisible solo para alinear etiqueta/valor.
- Etiquetas y valores de datos: texto negro.
- Formula: resaltado fino, autoajustado al texto, no a todo el ancho de hoja.
- Formula: el contenido del `<td>` debe ir en una sola línea, sin saltos ni espacios de indentación antes/después del texto. Esto evita que Word agregue espacio visual antes o después del párrafo.
- Resultados: tabla centrada.
- Resultados: contenido centrado.
- Resultados: sin borde exterior pesado.
- Resultados: con bordes verticales internos y líneas horizontales finas.

CSS recomendado para Word:

```js
const wordCss =
  `@page{margin:2cm 1.8cm}` +
  `body{font-family:Calibri,Arial,sans-serif;font-size:10.5pt;color:#1f2430;margin:0}` +
  `h2{font-size:10pt;font-weight:600;text-transform:uppercase;letter-spacing:.04em;margin:0 0 6pt;color:#34468f}` +
  `table{border-collapse:collapse}` +
  `.datos{width:100%;margin:0 0 12pt}` +
  `.datos td{border:0;padding:2.2pt 0;vertical-align:top}` +
  `.datos tr.gap td{padding-top:7pt}` +
  `.datos .label{width:31%;color:#1f2430;font-size:9.5pt}` +
  `.datos .value{color:#1f2430}` +
  `.formula-box{width:auto;margin:9pt 0 13pt;border-collapse:collapse}` +
  `.formula-box td{background:#eef1fa;border:0;border-left:2pt solid #34468f;padding:3pt 8pt;color:#1f2430;line-height:1.15;mso-line-height-rule:exactly;white-space:nowrap}` +
  `.formula-box span{color:#6b7280;margin-left:8pt;font-size:9.5pt}` +
  `.results-title{text-align:center;margin-top:16pt}` +
  `.res{width:86%;margin-left:auto;margin-right:auto;mso-table-lspace:0pt;mso-table-rspace:0pt}` +
  `.res th,.res td{border:0;border-left:.5pt solid #b7bfdc;padding:4.5pt 8pt;font-size:10pt;text-align:center;font-variant-numeric:tabular-nums}` +
  `.res th:first-child,.res td:first-child{border-left:0}` +
  `.res th{background:#eef1fa;color:#34468f;font-weight:600;border-bottom:1pt solid #34468f}` +
  `.res tbody td{border-top:.5pt solid #e5e8f3}`;
```

Estructura recomendada:

```html
<h2>Datos y coeficientes</h2>
<table class="datos">
  <tbody>
    ...
  </tbody>
</table>
```

Formula compacta:

```text
<table class="formula-box"><tbody><tr><td><b>q<sub>z</sub> = ...</b><span>[unidades]</span></td></tr></tbody></table>
```

```html
<h2 class="results-title">Resultados</h2>
<table class="res">
  <thead>
    ...
  </thead>
  <tbody>
    ...
  </tbody>
</table>
```

Mantener la fórmula en una sola línea aunque el resto del HTML esté formateado. En esta celda el formato compacto es intencional.

## Guardado standalone

Cuando una planilla tenga botón `Guardar`, debe generar el mismo HTML con el estado incrustado. El flujo recomendado es:

1. Tomar `document.documentElement.outerHTML`.
2. Reemplazar el bloque `/*__STATE_START__*/.../*__STATE_END__*/`.
3. Reconstruir el documento con `<!DOCTYPE html>\n`.
4. Intentar usar `window.showSaveFilePicker`.
5. Sugerir como nombre el nombre del archivo actual.
6. Si el usuario elige el mismo archivo, se pisa y queda actualizado.
7. Si el navegador no soporta `showSaveFilePicker`, usar descarga con `<a download>`.

Importante: por seguridad, el navegador no permite forzar al 100% la carpeta inicial del selector. Sí se puede sugerir el nombre del archivo actual y el usuario elige dónde guardarlo. En Chromium/Edge, si se selecciona el HTML existente, se sobrescribe correctamente.

Implementación base:

```js
function nombreArchivoActual() {
  const path = decodeURIComponent(location.pathname || "");
  const name = path.split("/").filter(Boolean).pop() || "planilla.html";
  return /\.html?$/i.test(name) ? name : `${name}.html`;
}

function descargarHtml(doc, filename) {
  const blob = new Blob([doc], { type: "text/html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

async function guardar() {
  const estado = estadoActual();
  const json = JSON.stringify(estado, null, 2);
  let html = document.documentElement.outerHTML;

  html = html.replace(
    /\/\*__STATE_START__\*\/[\s\S]*?\/\*__STATE_END__\*\//,
    `/*__STATE_START__*/${json}/*__STATE_END__*/`,
  );

  const doc = "<!DOCTYPE html>\n" + html;
  const filename = nombreArchivoActual();

  if (typeof window.showSaveFilePicker === "function") {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: "Archivo HTML",
            accept: { "text/html": [".html", ".htm"] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(doc);
      await writable.close();
      return;
    } catch (err) {
      if (err && err.name === "AbortError") return;
      console.warn("No se pudo abrir el selector de guardado:", err);
    }
  }

  descargarHtml(doc, filename);
}
```

El archivo guardado debe conservar:

- Logo incrustado.
- CSS incrustado.
- Estado del cálculo.
- Tema activo.
- Footer de contacto.

## Checklist antes de cerrar una planilla

- El HTML abre con doble click sin servidor.
- El logo no depende de un archivo externo.
- El tema oscuro abre por defecto.
- El logo se ve blanco en oscuro y azul institucional en claro.
- El acento visible usa `#34468f` en claro y `#9eadea` en oscuro.
- El footer contiene los datos de contacto vigentes.
- La exportación Word, si existe, usa el estilo minimalista definido arriba.
- No quedan colores azules viejos ni referencias externas innecesarias.
- Se probó en navegador que no haya errores de consola.
