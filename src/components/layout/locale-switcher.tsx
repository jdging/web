"use client";

import { useLocale, useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function LocaleSwitcher() {
  const locale = useLocale();
  const t = useTranslations("Locale");
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      role="group"
      aria-label={t("switch")}
      className="inline-flex items-center rounded-full border border-border p-0.5 font-mono text-[11px] uppercase tracking-wide"
    >
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => router.replace(pathname, { locale: loc })}
          aria-current={locale === loc}
          className={cn(
            "rounded-full px-2.5 py-1 transition-colors",
            locale === loc
              ? "bg-brand text-brand-contrast"
              : "text-text-secondary hover:text-text",
          )}
        >
          {loc}
        </button>
      ))}
    </div>
  );
}
