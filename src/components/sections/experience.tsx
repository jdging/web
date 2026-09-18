import { useTranslations } from "next-intl";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { formatDateRange } from "@/lib/utils";
import type { ExperienceItem } from "@/content/types";

export function Experience({
  items,
  locale,
}: {
  items: ExperienceItem[];
  locale: string;
}) {
  const t = useTranslations("Experience");

  return (
    <Section id="experience" subtle>
      <Reveal>
        <SectionHeading eyebrow={t("label")} title={t("title")} />
      </Reveal>

      <ol className="relative mt-12 space-y-10 border-l border-border pl-8 sm:pl-10">
        {items.map((item, i) => (
          <Reveal as="li" key={item.id} delay={i * 0.05} className="relative">
            <span className="absolute -left-[calc(2rem+5px)] top-1.5 h-2.5 w-2.5 rounded-full bg-brand sm:-left-[calc(2.5rem+5px)]" />
            <p className="font-mono text-xs uppercase tracking-wide text-text-muted">
              {formatDateRange(item.startDate, item.endDate, locale, t("present"))}
            </p>
            <h3 className="mt-1.5 font-heading text-lg font-bold text-text">{item.role}</h3>
            <p className="font-heading text-sm font-semibold text-brand">{item.company}</p>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary">
              {item.summary}
            </p>
            <ul className="mt-3 space-y-1.5">
              {item.highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="max-w-2xl text-sm leading-relaxed text-text-secondary marker:text-brand"
                  style={{ listStyleType: "square" }}
                >
                  <span className="ml-5 block -indent-5">
                    <span aria-hidden className="mr-2 text-brand">
                      —
                    </span>
                    {highlight}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
