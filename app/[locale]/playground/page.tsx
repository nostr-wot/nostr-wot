import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import PlaygroundContent from "./PlaygroundContent";
import { generateAlternates, generateOpenGraph, generateTwitter } from "@/lib/metadata";
import { type Locale } from "@/i18n/config";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("playground.meta");
  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    keywords: ["nostr wot playground", "nostr trust explorer"],
    alternates: generateAlternates("/playground", locale as Locale),
    openGraph: generateOpenGraph({
      title,
      description,
      path: "/playground",
      locale: locale as Locale,
    }),
    twitter: generateTwitter({ title, description }),
  };
}

export default async function PlaygroundPage() {
  const t = await getTranslations("playground.meta");

  // JSON-LD structured data for the playground page
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": t("title"),
    "description": t("description"),
    "url": "https://nostr-wot.com/playground",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "featureList": [
      "Explore public Nostr follows",
      "Interactive 2D and 3D social graph",
      "Graph, list and timeline views",
    ],
    "provider": {
      "@type": "Organization",
      "name": "Nostr Web of Trust",
      "url": "https://nostr-wot.com",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PlaygroundContent />
    </>
  );
}
