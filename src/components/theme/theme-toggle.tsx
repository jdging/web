"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const t = useTranslations("Theme");

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={t("toggle")}
      title={theme === "light" ? t("dark") : t("light")}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-secondary transition-colors hover:border-border-strong hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span suppressHydrationWarning>
        {theme === "light" ? <Moon size={16} aria-hidden /> : <Sun size={16} aria-hidden />}
      </span>
    </button>
  );
}
