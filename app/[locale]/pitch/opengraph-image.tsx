import { getTranslations } from "next-intl/server";
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Nostr Web of Trust — Pitch";
export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";

export default async function OgImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pitch.slide0" });
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage:
              "linear-gradient(rgba(124,58,237,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.08) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Glow */}
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
          }}
        />

        {/* Label */}
        <div
          style={{
            display: "flex",
            fontSize: 16,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#7c3aed",
            marginBottom: 24,
          }}
        >
          nostr-wot.com
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "#fafafa",
              display: "flex",
              gap: 16,
            }}
          >
            {t.rich("titleLine1", { highlight: chunks => <span style={{ color: "#7c3aed" }}>{chunks}</span> })}
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "#fafafa",
              display: "flex",
              gap: 16,
            }}
          >
            {t.rich("titleLine2", { brand: chunks => <span style={{ color: "#7c3aed" }}>{chunks}</span> })}
          </div>
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: "rgba(250,250,250,0.5)",
            marginTop: 32,
            letterSpacing: "0.02em",
          }}
        >
          {t("subtitle")}
        </div>
      </div>
    ),
    { ...size }
  );
}
