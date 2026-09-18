import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { montserrat, lato, jetbrainsMono } from "@/lib/fonts";
import { ThemeScript } from "@/components/theme/theme-script";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getContent } from "@/content";
import { SITE_URL } from "@/lib/site";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const content = getContent(locale as AppLocale);
  const isEn = locale === "en";

  const title = `${content.person.name} — ${content.person.role}`;
  const description = isEn
    ? "Structural & Systems Engineer: industrial-scale steel and concrete calculation, plus custom management systems and AI automation."
    : "Ingeniero en Estructuras & Sistemas: cálculo estructural de escala industrial en acero y hormigón, y sistemas de gestión y automatización con IA.";

  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      languages: { es: "/es", en: "/en" },
    },
    openGraph: {
      title,
      description,
      locale: isEn ? "en_US" : "es_AR",
      type: "profile",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as AppLocale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const content = getContent(locale as AppLocale);

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: content.person.name,
    jobTitle: content.person.role,
    address: content.person.location,
    email: content.person.email,
    sameAs: [content.person.linkedinUrl],
  };

  return (
    <html
      lang={locale}
      className={`${montserrat.variable} ${lato.variable} ${jetbrainsMono.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body className="min-h-full bg-bg font-body text-text antialiased" suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <a
              href="#top"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-brand-contrast"
            >
              Skip to content
            </a>
            <Header />
            {children}
            <Footer person={content.person} tagline={content.person.role} />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
