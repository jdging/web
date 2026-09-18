import { setRequestLocale } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";
import { getContent } from "@/content";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Stats } from "@/components/sections/stats";
import { Experience } from "@/components/sections/experience";
import { Projects } from "@/components/sections/projects";
import { Skills } from "@/components/sections/skills";
import { Education } from "@/components/sections/education";
import { Contact } from "@/components/sections/contact";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = getContent(locale as AppLocale);

  return (
    <main>
      <Hero person={content.person} />
      <About
        person={content.person}
        paragraphs={content.about.paragraphs}
        languages={content.languages}
        locale={locale}
        photoSrc="/images/juan-david-guzman.png"
      />
      <Stats stats={content.stats} person={content.person} locale={locale} />
      <Experience items={content.experience} locale={locale} />
      <Projects items={content.projects} />
      <Skills categories={content.skills} />
      <Education items={content.education} />
      <Contact person={content.person} />
    </main>
  );
}
