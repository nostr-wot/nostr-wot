import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";
import { getDeckMessages } from "@/messages/deck";
import { getAllGuides } from "@/lib/guides";
import {
  generateAlternates,
  generateOpenGraph,
  generateTwitter,
} from "@/lib/metadata";
import { withMetadataPolicy } from "@/lib/metadata-policy";
import Deck from "@/components/deck/Deck";
import manifest from "@/components/deck/slides.json";
import "./deck.css";
type Props = { params: Promise<{ locale: string }> };
export const generateMetadata = withMetadataPolicy(
  async ({ params }: Props) => {
    const { locale } = await params;
    const { slides } = await getDeckMessages(locale as Locale);
    const titles: Record<string, string> = {
      en: "Nostr explained: identity, trust and connected apps",
      es: "Qué es Nostr: identidad, confianza y aplicaciones",
      pt: "Entenda Nostr: identidade, confiança e aplicativos",
      fr: "Comprendre Nostr : identité, confiance et applications",
      it: "Capire Nostr: identità, fiducia e app connesse",
      de: "Nostr verstehen: Identität, Vertrauen und Apps",
      ru: "Как устроен Nostr: идентичность, доверие и приложения",
    };
    const title = titles[locale];
    const description = slides[0].summary;
    return {
      title,
      description,
      alternates: generateAlternates("/deck", locale as Locale),
      openGraph: generateOpenGraph({
        title,
        description,
        path: "/deck",
        locale: locale as Locale,
      }),
      twitter: generateTwitter({ title, description }),
    };
  },
);
export default async function DeckPage({ params }: Props) {
  const { locale: lang } = await params;
  if (!locales.includes(lang as Locale)) notFound();
  const locale = lang as Locale;
  setRequestLocale(locale);
  const messages = await getDeckMessages(locale);
  const spanish = getAllGuides("es"),
    translated = getAllGuides(locale);
  function localize(url: string) {
    if (!url || !url.startsWith("https://nostrwot.com")) return url;
    let path = new URL(url).pathname.replace(/^\/es(?=\/|$)/, "") || "/";
    if (path.startsWith("/guides/")) {
      const source = spanish.find((p) => p.slug === path.slice(8));
      const match =
        source &&
        translated.find((p) => p.translationKey === source.translationKey);
      path = match ? `/guides/${match.slug}` : "/guides";
    }
    return (
      (locale === "en" ? "" : `/${locale}`) + (path === "/" ? "" : path) || "/"
    );
  }
  const resources = [
    "https://nostrwot.com/es/download",
    "https://nostrwot.com/es/guides",
    "https://nostrwot.com/es/playground",
    "https://nostrwot.com/es/labs",
    "https://nostrwot.com/es/guides/que-es-nostr",
    "https://nostrwot.com/es/guides/entendiendo-web-of-trust",
    "https://github.com/nostr-protocol/nips",
    "https://nwc.dev",
    "https://nostrwot.com/es/contact",
    "https://github.com/nostr-wot",
  ].map((url, i) => ({
    title: messages.ui.resources[i][0],
    description: messages.ui.resources[i][1],
    href: localize(url),
  }));
  return (
    <Deck
      locale={locale}
      ui={messages.ui}
      slides={messages.slides.map((slide, i) => ({
        ...slide,
        ...manifest[i],
        link: localize(manifest[i].link),
      }))}
      resources={resources}
    />
  );
}
