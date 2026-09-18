import { cn } from "@/lib/utils";
import { LogoMark } from "./logo-mark";

const sizes = {
  sm: { mark: "h-6", tagline: "text-[9px] tracking-[0.18em]" },
  md: { mark: "h-9", tagline: "text-[10px] tracking-[0.2em]" },
  lg: { mark: "h-14", tagline: "text-xs tracking-[0.22em]" },
};

interface LogoProps {
  size?: keyof typeof sizes;
  tagline?: string | null;
  className?: string;
  markClassName?: string;
}

export function Logo({ size = "md", tagline, className, markClassName }: LogoProps) {
  const config = sizes[size];

  return (
    <div className={cn("inline-flex flex-col text-brand", className)}>
      <LogoMark className={cn(config.mark, "w-auto", markClassName)} />
      {tagline ? (
        <span
          className={cn(
            "mt-1.5 font-heading font-semibold uppercase text-text-secondary",
            config.tagline,
          )}
        >
          {tagline}
        </span>
      ) : null}
    </div>
  );
}
