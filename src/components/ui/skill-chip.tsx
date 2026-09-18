import { cn } from "@/lib/utils";

export function SkillChip({ name, highlight }: { name: string; highlight?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-1 font-heading text-[11px] font-semibold tracking-wide",
        highlight
          ? "border-brand bg-brand text-brand-contrast"
          : "border-border bg-bg-subtle text-text",
      )}
    >
      {name}
    </span>
  );
}
