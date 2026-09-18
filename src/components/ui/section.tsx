import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Container } from "./container";

interface SectionProps {
  id: string;
  children: ReactNode;
  className?: string;
  subtle?: boolean;
}

export function Section({ id, children, className, subtle }: SectionProps) {
  return (
    <section
      id={id}
      className={cn("scroll-mt-16 py-20 sm:py-28", subtle && "bg-bg-subtle", className)}
    >
      <Container>{children}</Container>
    </section>
  );
}
