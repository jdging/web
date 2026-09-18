import { useTranslations } from "next-intl";
import { PlayCircle, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { SkillChip } from "@/components/ui/skill-chip";
import type { ProjectItem } from "@/content/types";

export function ProjectCard({ project }: { project: ProjectItem }) {
  const t = useTranslations("Projects");

  return (
    <article
      className={cn(
        "rounded-xl border bg-surface p-6 transition-colors",
        project.featured ? "border-brand/40" : "border-border",
      )}
    >
      {project.videoUrl ? (
        <a
          href={project.videoUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="mb-5 flex aspect-video items-center justify-center gap-2 rounded-lg border border-dashed border-border-strong bg-bg-subtle font-heading text-sm font-semibold text-brand transition-colors hover:border-brand"
        >
          <PlayCircle size={18} />
          {t("watchVideo")}
        </a>
      ) : (
        <div className="mb-5 flex aspect-video items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-bg-subtle font-mono text-xs uppercase tracking-wide text-text-muted">
          <ImageOff size={14} />
          {t("imagePending")}
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <h3 className="font-heading text-base font-bold leading-snug text-text">
          {project.name}
        </h3>
        <span className="shrink-0 font-mono text-xs text-text-muted">{project.date}</span>
      </div>

      {project.role ? (
        <p className="mt-1 font-heading text-sm font-semibold text-brand">{project.role}</p>
      ) : null}
      {project.client ? (
        <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wide text-text-muted">
          {t("client")}: {project.client}
        </p>
      ) : null}

      <p className="mt-3 text-sm leading-relaxed text-text-secondary">{project.description}</p>

      {project.highlights?.length ? (
        <ul className="mt-3 space-y-1.5">
          {project.highlights.map((h) => (
            <li key={h} className="flex gap-2 text-sm leading-relaxed text-text-secondary">
              <span aria-hidden className="text-brand">
                —
              </span>
              {h}
            </li>
          ))}
        </ul>
      ) : null}

      {project.stack?.length ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.stack.map((s) => (
            <SkillChip key={s} name={s} />
          ))}
        </div>
      ) : null}
    </article>
  );
}
