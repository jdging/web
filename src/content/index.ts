import type { AppLocale } from "@/i18n/routing";
import { es } from "./es";
import { en } from "./en";
import type { SiteContent } from "./types";

const content: Record<AppLocale, SiteContent> = { es, en };

export function getContent(locale: AppLocale): SiteContent {
  return content[locale] ?? content.es;
}

export function getYearsOfExperience(careerStart: string, at: Date = new Date()): number {
  const [year, month] = careerStart.split("-").map(Number);
  const start = new Date(year, (month ?? 1) - 1, 1);
  const months =
    (at.getFullYear() - start.getFullYear()) * 12 + (at.getMonth() - start.getMonth());
  return Math.floor(months / 12);
}

export type { SiteContent } from "./types";
export * from "./types";
