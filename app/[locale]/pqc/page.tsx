import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { generateAlternates, generateOpenGraph, generateTwitter } from "@/lib/metadata";
import { type Locale } from "@/i18n/config";
import PqcContent from "./PqcContent";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("pqc.meta");
  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    keywords: [
      "nostr post-quantum",
      "nostr pqc",
      "ml-kem nostr",
      "post-quantum direct messages",
    ],
    alternates: generateAlternates("/pqc", locale as Locale),
    openGraph: generateOpenGraph({
      title,
      description,
      path: "/pqc",
      locale: locale as Locale,
    }),
    twitter: generateTwitter({ title, description }),
  };
}

export default function PqcPage() {
  return <PqcContent />;
}
