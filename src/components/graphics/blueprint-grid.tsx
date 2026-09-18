import { cn } from "@/lib/utils";

/**
 * Textura de grilla técnica de fondo, inspirada en las líneas de
 * construcción/área de seguridad del manual de marca. Puramente decorativa.
 */
export function BlueprintGrid({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="blueprint-grid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path
            d="M 48 0 L 0 0 0 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.35"
          />
        </pattern>
        <pattern
          id="blueprint-diagonal"
          width="240" height="240"
          patternUnits="userSpaceOnUse"
        >
          <path d="M0 240 L240 0" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.25" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
      <rect width="100%" height="100%" fill="url(#blueprint-diagonal)" />
    </svg>
  );
}
