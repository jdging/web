import { useTranslations } from "next-intl";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { ProjectCard } from "./project-card";
import type { ProjectItem } from "@/content/types";

export function Projects({ items }: { items: ProjectItem[] }) {
  const t = useTranslations("Projects");
  const structural = items.filter((p) => p.track === "structural");
  const systems = items.filter((p) => p.track === "systems");

  return (
    <Section id="projects">
      <Reveal>
        <SectionHeading eyebrow={t("label")} title={t("title")} subtitle={t("subtitle")} />
      </Reveal>

      <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-8">
        <div>
          <h3 className="mb-5 font-mono text-xs font-semibold uppercase tracking-[0.25em] text-text-muted">
            {t("trackStructural")}
          </h3>
          <div className="space-y-5">
            {structural.map((project, i) => (
              <Reveal key={project.id} delay={i * 0.05}>
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-5 font-mono text-xs font-semibold uppercase tracking-[0.25em] text-text-muted">
            {t("trackSystems")}
          </h3>
          <div className="space-y-5">
            {systems.map((project, i) => (
              <Reveal key={project.id} delay={i * 0.05}>
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
