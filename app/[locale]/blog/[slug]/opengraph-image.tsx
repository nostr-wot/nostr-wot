import { ImageResponse } from "next/og";
import { getBlogPost } from "@/lib/blog";
import { type Locale } from "@/i18n/config";

export const alt = "Nostr WoT Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function OgImage({ params }: Props) {
  const { locale, slug } = await params;
  const post = getBlogPost(slug, locale as Locale);
  const title = post?.title || "Nostr WoT Blog";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 80px",
          background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #1e1b4b 100%)",
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
              "linear-gradient(rgba(124,58,237,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.06) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Glow */}
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
            top: "-100px",
            right: "-100px",
            display: "flex",
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 14,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#7c3aed",
              fontWeight: 700,
            }}
          >
            Blog
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            fontSize: title.length > 40 ? 48 : 56,
            fontWeight: 800,
            color: "#fafafa",
            lineHeight: 1.2,
            maxWidth: 900,
          }}
        >
          {title}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: 80,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
            <path
              d="M32 4L8 14v18c0 14.4 10.4 27.2 24 30 13.6-2.8 24-15.6 24-30V14L32 4z"
              fill="#7c3aed"
            />
            <path
              d="M26 32l6 6 12-12"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div
            style={{
              display: "flex",
              fontSize: 20,
              color: "rgba(250,250,250,0.5)",
              letterSpacing: "0.02em",
            }}
          >
            nostr-wot.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
