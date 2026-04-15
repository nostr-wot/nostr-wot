import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Space_Mono, Syne } from "next/font/google";
import { generateAlternates, generateOpenGraph, generateTwitter } from "@/lib/metadata";
import { type Locale } from "@/i18n/config";
import PitchContent from "./PitchContent";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-pitch-mono",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  variable: "--font-pitch-sans",
  display: "swap",
});

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("pitch.meta");
  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    keywords: ["nostr wot", "web of trust platform"],
    alternates: generateAlternates("/pitch", locale as Locale),
    openGraph: generateOpenGraph({
      title,
      description,
      path: "/pitch",
      locale: locale as Locale,
    }),
    twitter: generateTwitter({ title, description }),
  };
}

export default async function PitchPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className={`${spaceMono.variable} ${syne.variable}`}>
      <PitchContent />
    </div>
  );
}
