import { useTranslations } from "next-intl";
import { GraduationCap, BookOpen, Award } from "lucide-react";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import type { EducationItem } from "@/content/types";

const icons: Record<EducationItem["type"], typeof GraduationCap> = {
  degree: GraduationCap,
  postgraduate: GraduationCap,
  teaching: BookOpen,
  certification: Award,
};

export function Education({ items }: { items: EducationItem[] }) {
  const t = useTranslations("Education");

  return (
    <Section id="education">
      <Reveal>
        <SectionHeading eyebrow={t("label")} title={t("title")} />
      </Reveal>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {items.map((item, i) => {
          const Icon = icons[item.type];
          return (
            <Reveal
              key={item.id}
              delay={i * 0.06}
              className="flex gap-4 rounded-xl border border-border bg-surface p-6"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                <Icon size={18} />
              </div>
              <div>
                <h3 className="font-heading text-sm font-bold text-text">{item.title}</h3>
                <p className="mt-0.5 text-sm text-text-secondary">{item.institution}</p>
                {item.detail ? (
                  <p className="mt-1 text-sm text-text-muted">{item.detail}</p>
                ) : null}
                {item.startYear ? (
                  <p className="mt-1.5 font-mono text-[11px] text-text-muted">
                    {item.startYear}
                    {item.endYear ? ` — ${item.endYear}` : item.type === "teaching" ? "+" : ""}
                  </p>
                ) : null}
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
