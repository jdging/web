import { useTranslations } from "next-intl";
import Image from "next/image";
import { MapPin, GraduationCap, Languages, Download } from "lucide-react";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { PhotoPlaceholder } from "@/components/graphics/photo-placeholder";
import { getYearsOfExperience } from "@/content";
import type { PersonInfo, LanguageItem } from "@/content/types";

interface AboutProps {
  person: PersonInfo;
  paragraphs: string[];
  languages: LanguageItem[];
  locale: string;
  photoSrc?: string | null;
}

export function About({ person, paragraphs, languages, locale, photoSrc }: AboutProps) {
  const t = useTranslations("About");
  const years = getYearsOfExperience(person.careerStart);

  return (
    <Section id="about">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
        <div>
          <Reveal>
            <SectionHeading eyebrow={t("label")} title={t("title")} />
          </Reveal>

          <div className="mt-8 space-y-5 text-base leading-relaxed text-text-secondary">
            {paragraphs.map((paragraph, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <p>{paragraph}</p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2}>
            <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-border pt-8 sm:grid-cols-4">
              <div>
                <dt className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-text-muted">
                  <MapPin size={12} /> {t("factsLocation")}
                </dt>
                <dd className="mt-1 font-heading text-sm font-semibold text-text">
                  {person.location}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-wide text-text-muted">
                  {t("factsExperience")}
                </dt>
                <dd className="mt-1 font-heading text-sm font-semibold text-text">
                  {years}+ {locale === "en" ? "years" : "años"}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-text-muted">
                  <Languages size={12} /> {t("factsLanguages")}
                </dt>
                <dd className="mt-1 font-heading text-sm font-semibold text-text">
                  {languages.map((l) => l.language).join(" · ")}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-text-muted">
                  <GraduationCap size={12} /> {t("factsTeaching")}
                </dt>
                <dd className="mt-1 font-heading text-sm font-semibold text-text">UNR · 2022+</dd>
              </div>
            </dl>
          </Reveal>

          <Reveal delay={0.28}>
            <a
              href={`/cv/jdg-cv-${locale}.pdf`}
              download
              className="mt-8 inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 font-heading text-sm font-semibold text-text transition-colors hover:border-brand hover:text-brand"
            >
              <Download size={16} />
              {t("downloadCv")}
            </a>
            <p className="mt-2 font-mono text-[11px] text-text-muted">{t("downloadCvHint")}</p>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="lg:sticky lg:top-24 lg:h-fit">
          {photoSrc ? (
            <Image
              src={photoSrc}
              alt={person.name}
              width={480}
              height={600}
              className="aspect-[4/5] w-full rounded-2xl object-cover"
              priority={false}
            />
          ) : (
            <PhotoPlaceholder />
          )}
        </Reveal>
      </div>
    </Section>
  );
}
