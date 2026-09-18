import { useTranslations } from "next-intl";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { SkillChip } from "@/components/ui/skill-chip";
import type { SkillCategory } from "@/content/types";

export function Skills({ categories }: { categories: SkillCategory[] }) {
  const t = useTranslations("Skills");

  return (
    <Section id="skills" subtle>
      <Reveal>
        <SectionHeading eyebrow={t("label")} title={t("title")} />
      </Reveal>

      <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-10">
        {categories.map((category, i) => (
          <Reveal
            key={category.id}
            delay={i * 0.08}
            className="rounded-xl border border-border bg-surface p-7"
          >
            <h3 className="font-heading text-lg font-bold text-text">{t(category.nameKey)}</h3>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              {category.description}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {category.tags.map((tag) => (
                <SkillChip key={tag.name} name={tag.name} highlight={tag.highlight} />
              ))}
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
