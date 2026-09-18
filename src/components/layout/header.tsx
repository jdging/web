"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LocaleSwitcher } from "./locale-switcher";
import { Container } from "@/components/ui/container";

const sectionIds = ["about", "experience", "projects", "skills", "education", "contact"] as const;

export function Header() {
  const t = useTranslations("Nav");
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/85 backdrop-blur supports-[backdrop-filter]:bg-bg/70">
      <Container className="flex h-16 items-center justify-between">
        <a href="#top" className="flex items-center" aria-label="JDG — inicio">
          <Logo size="sm" tagline={null} />
        </a>

        <nav aria-label="Principal" className="hidden items-center gap-7 md:flex">
          {sectionIds.map((id) => (
            <a
              key={id}
              href={`#${id}`}
              className="font-heading text-sm font-medium text-text-secondary transition-colors hover:text-text"
            >
              {t(id)}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>

        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-text md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? t("menuClose") : t("menuOpen")}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </Container>

      {open ? (
        <div className="border-t border-border bg-bg md:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {sectionIds.map((id) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2.5 font-heading text-sm font-medium text-text-secondary hover:bg-bg-subtle hover:text-text"
              >
                {t(id)}
              </a>
            ))}
            <div className="mt-2 flex items-center justify-between px-2">
              <LocaleSwitcher />
              <ThemeToggle />
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
