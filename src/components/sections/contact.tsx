import { useTranslations } from "next-intl";
import { Mail, MessageCircle } from "lucide-react";
import { LinkedinIcon } from "@/components/icons/linkedin-icon";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import type { PersonInfo } from "@/content/types";

export function Contact({ person }: { person: PersonInfo }) {
  const t = useTranslations("Contact");

  return (
    <Section id="contact" subtle>
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.3em] text-brand">
          {t("label")}
        </span>
        <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-text sm:text-4xl">
          {t("title")}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-text-secondary">{t("subtitle")}</p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <a
            href={`mailto:${person.email}`}
            className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-3 font-heading text-sm font-semibold text-brand-contrast transition-opacity hover:opacity-90"
          >
            <Mail size={16} />
            {t("emailCta")}
          </a>
          <a
            href={person.whatsappUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-3 font-heading text-sm font-semibold text-text transition-colors hover:border-border-strong"
          >
            <MessageCircle size={16} />
            {t("whatsappCta")}
          </a>
          <a
            href={person.linkedinUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-3 font-heading text-sm font-semibold text-text transition-colors hover:border-border-strong"
          >
            <LinkedinIcon width={16} height={16} />
            {t("linkedinCta")}
          </a>
        </div>
      </Reveal>
    </Section>
  );
}
