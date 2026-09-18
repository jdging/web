import { ImageResponse } from "next/og";
import { getContent } from "@/content";
import type { AppLocale } from "@/i18n/routing";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const content = getContent(locale as AppLocale);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#1e2348",
          backgroundImage:
            "linear-gradient(135deg, rgba(255,255,255,0.06) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.06) 75%, transparent 75%, transparent)",
          backgroundSize: "48px 48px",
        }}
      >
        <div
          style={{
            fontSize: 40,
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-0.02em",
          }}
        >
          JDG
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 60,
            fontWeight: 800,
            color: "#ffffff",
            maxWidth: 900,
            lineHeight: 1.15,
          }}
        >
          {content.person.name}
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 32,
            color: "#b9bede",
            maxWidth: 900,
          }}
        >
          {content.person.role}
        </div>
      </div>
    ),
    { ...size },
  );
}
