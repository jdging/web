/**
 * Genera el CV en PDF (ES y EN) a partir de la MISMA capa de contenido
 * que alimenta el sitio (src/content), reutilizando sin modificar el
 * design system existente del usuario (cv/cv_styles.css y cv/logoclaro.svg).
 *
 * No se toca ningún archivo dentro de cv/ — solo se leen como fuente.
 *
 * Uso: npx tsx scripts/generate-cv.ts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { getContent } from "../src/content";
import type { AppLocale } from "../src/i18n/routing";
import esMessages from "../messages/es.json" with { type: "json" };
import enMessages from "../messages/en.json" with { type: "json" };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BUILD_DIR = path.join(ROOT, ".cv-build");
const OUT_DIR = path.join(ROOT, "public", "cv");

const messages: Record<AppLocale, typeof esMessages> = {
  es: esMessages,
  en: enMessages,
};

const labels: Record<AppLocale, Record<string, string>> = {
  es: {
    summary: "Perfil",
    competencies: "Competencias técnicas",
    experience: "Experiencia laboral",
    projects: "Proyectos destacados",
    education: "Educación y docencia",
    languages: "Idiomas",
    present: "Actualidad",
    client: "Cliente",
  },
  en: {
    summary: "Profile",
    competencies: "Skills",
    experience: "Work experience",
    projects: "Featured projects",
    education: "Education & teaching",
    languages: "Languages",
    present: "Present",
    client: "Client",
  },
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(value: string, locale: AppLocale): string {
  const [year, month] = value.split("-").map(Number);
  const formatter = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-AR", {
    month: "short",
    year: "numeric",
  });
  return formatter.format(new Date(year, (month ?? 1) - 1, 1));
}

function buildCvHtml(locale: AppLocale): string {
  const content = getContent(locale);
  const t = labels[locale];
  const logoSvg = fs.readFileSync(path.join(ROOT, "cv", "logoclaro.svg"), "utf-8");
  const { person } = content;

  const skillsHtml = content.skills
    .map(
      (category) => `
      <div class="competence-block">
        <div class="competence-cat">${escapeHtml(
          messages[locale].Skills[category.nameKey as "categoryStructural" | "categorySystems"],
        )}</div>
        <p class="competence-text">${escapeHtml(category.description)}</p>
      </div>`,
    )
    .join("");

  const skillTagsHtml = content.skills
    .flatMap((c) => c.tags)
    .map(
      (tag) =>
        `<span class="skill-tag${tag.highlight ? " highlight" : ""}">${escapeHtml(tag.name)}</span>`,
    )
    .join("");

  const experienceHtml = content.experience
    .map(
      (item) => `
      <div class="entry">
        <div class="entry-header">
          <span class="entry-title">${escapeHtml(item.role)}</span>
          <span class="entry-meta">${formatDate(item.startDate, locale)} — ${
            item.endDate ? formatDate(item.endDate, locale) : t.present
          }</span>
        </div>
        <div class="entry-subtitle">${escapeHtml(item.company)} · ${escapeHtml(item.location)}</div>
        <ul>
          ${item.highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join("")}
        </ul>
      </div>`,
    )
    .join("");

  const featuredProjects = content.projects.filter((p) => p.featured);
  const projectsHtml = featuredProjects
    .map(
      (project) => `
      <div class="project-box">
        <div class="project-header">
          <span class="project-name">${escapeHtml(project.name)}</span>
          <span class="project-role">${escapeHtml(project.date)}</span>
        </div>
        <p class="project-desc">${escapeHtml(project.description)}</p>
        ${
          project.stack?.length
            ? `<div class="project-stack">${project.stack.map(escapeHtml).join(" · ")}</div>`
            : ""
        }
      </div>`,
    )
    .join("");

  const educationHtml = content.education
    .map(
      (item) => `
      <div class="edu-item">
        <div class="edu-text"><strong>${escapeHtml(item.title)}</strong> — ${escapeHtml(
          item.institution,
        )}</div>
        ${
          item.startYear
            ? `<div class="edu-date">${item.startYear}${item.endYear ? ` — ${item.endYear}` : "+"}</div>`
            : ""
        }
      </div>`,
    )
    .join("");

  const languagesHtml = content.languages
    .map(
      (lang) => `
      <div class="lang-item">
        <strong>${escapeHtml(lang.language)}</strong> — ${escapeHtml(lang.level)}
        ${lang.certification ? `<span class="lang-detail">(${escapeHtml(lang.certification)})</span>` : ""}
      </div>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(person.name)} — CV</title>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700;900&family=Lato:wght@300;400;700&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="cv_styles.css">
</head>
<body>
<div class="page">
  <div class="header">
    <div class="header-left">
      <div class="logo">${logoSvg}</div>
      <h1>${escapeHtml(person.name)}</h1>
      <div class="tagline">${escapeHtml(person.role)}</div>
    </div>
    <div class="contact">
      <a href="mailto:${person.email}">${person.email}</a>
      <span>${escapeHtml(person.phone)}</span>
      <a href="${person.linkedinUrl}">${person.linkedinUrl.replace("https://", "")}</a>
      <span>${escapeHtml(person.location)}</span>
    </div>
  </div>

  <div class="summary">
    <p>${escapeHtml(content.about.paragraphs[0])}</p>
  </div>

  <div class="section">
    <div class="section-label">${t.competencies}</div>
    ${skillsHtml}
    <div class="skills-grid">${skillTagsHtml}</div>
  </div>

  <div class="section">
    <div class="section-label">${t.experience}</div>
    ${experienceHtml}
  </div>

  <div class="section">
    <div class="section-label">${t.projects}</div>
    ${projectsHtml}
  </div>

  <div class="section">
    <div class="section-label">${t.education}</div>
    ${educationHtml}
  </div>

  <div class="section">
    <div class="section-label">${t.languages}</div>
    <div class="lang-row">${languagesHtml}</div>
  </div>

  <div class="footer">${escapeHtml(person.name)} · ${escapeHtml(person.linkedinUrl)}</div>
</div>
</body>
</html>`;
}

async function main() {
  fs.mkdirSync(BUILD_DIR, { recursive: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.copyFileSync(path.join(ROOT, "cv", "cv_styles.css"), path.join(BUILD_DIR, "cv_styles.css"));

  const browser = await chromium.launch();

  for (const locale of ["es", "en"] as AppLocale[]) {
    const html = buildCvHtml(locale);
    const htmlPath = path.join(BUILD_DIR, `${locale}.html`);
    fs.writeFileSync(htmlPath, html, "utf-8");

    const page = await browser.newPage();
    await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle" });
    const outPath = path.join(OUT_DIR, `jdg-cv-${locale}.pdf`);
    await page.pdf({ path: outPath, preferCSSPageSize: true, printBackground: true });
    await page.close();
    console.log(`✓ ${outPath}`);
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
