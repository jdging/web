import { useTranslations } from "next-intl";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { CountUp } from "@/components/ui/count-up";
import { getYearsOfExperience } from "@/content";
import type { PersonInfo, Stat } from "@/content/types";

export function Stats({
  stats,
  person,
  locale,
}: {
  stats: Stat[];
  person: PersonInfo;
  locale: string;
}) {
  const t = useTranslations("Stats");
  const years = getYearsOfExperience(person.careerStart);

  return (
    <Section id="stats-inline" className="border-y border-border py-14 sm:py-16" subtle>
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat, i) => (
          <Reveal key={stat.id} delay={i * 0.06}>
            <p className="font-heading text-3xl font-bold text-brand sm:text-4xl">
              <CountUp
                value={stat.id === "years" ? years : stat.value}
                suffix={stat.suffix}
                locale={locale === "en" ? "en-US" : "es-AR"}
              />
            </p>
            <p className="mt-1.5 font-mono text-[11px] uppercase tracking-wide text-text-muted">
              {t(stat.labelKey)}
            </p>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
