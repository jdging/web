import { useTranslations } from "next-intl";
import { ArrowDown } from "lucide-react";
import { Container } from "@/components/ui/container";
import { BlueprintGrid } from "@/components/graphics/blueprint-grid";
import { StructuralHeroGraphic } from "@/components/graphics/structural-hero-graphic";
import type { PersonInfo } from "@/content/types";

export function Hero({ person }: { person: PersonInfo }) {
  const t = useTranslations("Hero");

  return (
    <section id="top" className="relative overflow-hidden border-b border-border">
      <div className="pointer-events-none absolute inset-0 text-border-strong">
        <BlueprintGrid />
      </div>

      <Container className="relative grid min-h-[calc(100svh-4rem)] items-center gap-12 py-16 lg:grid-cols-2 lg:py-0">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-text-muted">
            {person.name}
          </p>
          <span className="mt-4 inline-block rounded-full border border-brand/30 bg-brand/5 px-3 py-1 font-heading text-xs font-semibold uppercase tracking-wide text-brand">
            {t("eyebrow")}
          </span>
          <h1 className="mt-5 max-w-xl font-heading text-4xl font-bold leading-[1.1] tracking-tight text-text sm:text-5xl">
            {t("headline")}
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-text-secondary">
            {t("subheadline")}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#projects"
              className="inline-flex items-center justify-center rounded-md bg-brand px-5 py-3 font-heading text-sm font-semibold text-brand-contrast transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              {t("ctaPrimary")}
            </a>
            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-md border border-border px-5 py-3 font-heading text-sm font-semibold text-text transition-colors hover:border-border-strong"
            >
              {t("ctaSecondary")}
            </a>
          </div>
        </div>

        <div className="relative mx-auto hidden aspect-square w-full max-w-md text-brand lg:block">
          <StructuralHeroGraphic className="h-full w-full" />
        </div>
      </Container>

      <a
        href="#about"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-text-muted transition-colors hover:text-text sm:flex"
      >
        <span className="font-mono text-[10px] uppercase tracking-widest">
          {t("scrollHint")}
        </span>
        <ArrowDown size={14} className="animate-bounce" aria-hidden />
      </a>
    </section>
  );
}
