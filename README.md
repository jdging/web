# Web personal — Juan David Guzmán (JDG)

Sitio personal/profesional construido con Next.js (App Router), TypeScript, Tailwind CSS y next-intl. Diseño basado en el Manual de Marca de JDG.

## Desarrollo

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) (redirige a `/es`).

## Estructura

- `src/content/` — capa de contenido tipada (ES/EN), curada a partir de `cv/` (no se edita `cv/` directamente).
- `src/components/sections/` — una sección del home por archivo.
- `src/app/[locale]/` — rutas localizadas (`es`/`en`) vía `next-intl`.
- `messages/` — textos de interfaz (nav, botones, labels) por idioma.
- `scripts/generate-cv.ts` — genera el CV en PDF (ES/EN) a partir del mismo contenido del sitio, reutilizando `cv/cv_styles.css` y `cv/logoclaro.svg` sin modificarlos.

## Regenerar el CV descargable

Cada vez que se actualiza `src/content/es.ts` o `en.ts`:

```bash
npm run generate:cv
```

Esto sobrescribe `public/cv/jdg-cv-es.pdf` y `public/cv/jdg-cv-en.pdf`. Requiere Playwright (`npx playwright install chromium` la primera vez).

## Build y deploy

```bash
npm run build
```

Deploy recomendado: [Vercel](https://vercel.com) (conectando este repo, cero configuración adicional).

## Actualizar el dominio

El dominio del sitio está centralizado en `src/lib/site.ts` (`SITE_URL`) — se usa en metadata, `sitemap.xml` y `robots.txt`.
