import { useTranslations } from "next-intl";
import { Mail, ArrowUp } from "lucide-react";
import { LinkedinIcon } from "@/components/icons/linkedin-icon";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/ui/container";
import type { PersonInfo } from "@/content/types";

export function Footer({ person, tagline }: { person: PersonInfo; tagline: string }) {
  const t = useTranslations("Footer");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-white">
      <Container className="flex flex-col gap-8 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div className="text-white">
          <Logo size="md" tagline={tagline} className="text-white" />
          <p className="mt-4 max-w-xs text-sm text-white/70">{person.location}</p>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <div className="flex items-center gap-4">
            <a
              href={`mailto:${person.email}`}
              aria-label={person.email}
              className="text-white/80 transition-colors hover:text-white"
            >
              <Mail size={18} />
            </a>
            <a
              href={person.linkedinUrl}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="LinkedIn"
              className="text-white/80 transition-colors hover:text-white"
            >
              <LinkedinIcon width={18} height={18} />
            </a>
          </div>
          <a
            href="#top"
            className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-white/60 transition-colors hover:text-white"
          >
            {t("backToTop")}
            <ArrowUp size={12} />
          </a>
        </div>
      </Container>
      <div className="border-t border-white/10">
        <Container className="py-4 text-xs text-white/50">
          © {year} {person.name}. {t("rights")}
        </Container>
      </div>
    </footer>
  );
}
