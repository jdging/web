import { LogoMark } from "@/components/brand/logo-mark";
import { cn } from "@/lib/utils";

/**
 * Reemplazo visual mientras no hay foto profesional cargada. Mantiene la
 * disciplina de marca (navy + blanco, sin fotografía genérica de stock)
 * en vez de dejar un vacío o un ícono de "imagen rota".
 */
export function PhotoPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-2xl bg-ink",
        className,
      )}
    >
      <div className="facet-divider absolute inset-0 bg-white/[0.04]" />
      <LogoMark className="h-20 w-auto text-white/25" />
    </div>
  );
}
