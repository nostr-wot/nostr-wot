import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { type Locale } from "@/i18n/config";
import { FeaturedArtwork } from "@/components/illustrations/FeaturedArtwork";
import { LinkButton, ExternalLinkButton } from "@/components/ui";
import { ArrowRightIcon } from "@/components/icons";
import { NewsletterSection } from "@/components/layout/NewsletterSection";
import { generateAlternates, generateOpenGraph, generateTwitter, getFullUrl } from "@/lib/metadata";
import { withMetadataPolicy } from "@/lib/metadata-policy";
import { serializeJsonLd } from "@/lib/serialize-jsonld";
import { getGuideTranslations } from "@/lib/guides";
import { getAllNews } from "@/lib/news";

type Props = {
  params: Promise<{ locale: string }>;
};

async function pageMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("home.meta");
  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    keywords: ["nostr wot", "nostr web of trust", "nostr extension", "nostr identity", "nostr lightning wallet", "nip-07 signer", "trust assertions", "post-quantum nostr", "quantum resistant nostr", "ml-kem", "ml-dsa"],
    alternates: generateAlternates("/", locale as Locale),
    openGraph: generateOpenGraph({
      title,
      description,
      path: "/",
      locale: locale as Locale,
    }),
    twitter: generateTwitter({ title, description }),
  };
}


export default async function Home({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("home.experience");
  const common = await getTranslations("common");
  const guide = (key: string) => {
    const slug = getGuideTranslations(key)[locale as Locale];
    return slug ? `/guides/${slug}` : "/guides";
  };
  const playlist = "https://www.youtube.com/playlist?list=PLEmTf_Ex3n7c";
  const schema = {
    "@context": "https://schema.org", "@graph": [
      { "@type": "Organization", "@id": "https://nostr-wot.com/#organization", name: "Nostr WoT", url: "https://nostr-wot.com", logo: "https://nostr-wot.com/icon-512.png", sameAs: ["https://github.com/nostr-wot", "https://www.youtube.com/@nostr-wot"] },
      { "@type": "WebSite", name: "Nostr WoT", url: getFullUrl("/", locale as Locale), description: t("intro"), inLanguage: locale },
    ],
  };
  const stories = [
    { key: "identity", image: "accounts", href: guide("create-nostr-account") },
    { key: "rules", image: "permissions", href: guide("site-permissions") },
    { key: "zap", image: "zap-review", href: guide("zapping-auto-approve") },
  ] as const;
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />
    <section className="mx-auto max-w-7xl px-6 pb-16 pt-16 lg:pb-24 lg:pt-24">
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr]">
        <div>
          <p className="mb-5 font-semibold text-indigo-700 dark:text-indigo-300">{t("eyebrow")}</p>
          <h1 className="max-w-2xl text-5xl font-bold leading-[1.06] tracking-tight sm:text-6xl lg:text-7xl">{t("title")}</h1>
          <p className="mt-7 max-w-lg text-xl leading-relaxed text-gray-600 dark:text-gray-300">{t("intro")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/download">{t("install")}<ArrowRightIcon className="h-5 w-5" /></LinkButton>
            <ExternalLinkButton href={playlist} variant="outline">{t("watch")}</ExternalLinkButton>
          </div>
        </div>
        <FeaturedArtwork art="home" priority className="lg:rotate-2" />
      </div>
    </section>
    {stories.map(({ key, image, href }, index) => <section key={key} className="border-t border-gray-200 dark:border-gray-800">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-2 lg:gap-24 lg:py-24">
        <div className={index % 2 ? "md:order-2" : ""}>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{t(`${key}Title`)}</h2>
          <p className="mt-6 text-lg leading-relaxed text-gray-600 dark:text-gray-300">{t(`${key}Body`)}</p>
          {key === "rules" && <p className="mt-4 text-lg leading-relaxed text-gray-600 dark:text-gray-300">{t("rulesDetail")}</p>}
          <Link href={href} className="mt-7 inline-flex items-center gap-2 font-semibold text-indigo-700 underline-offset-4 hover:underline dark:text-indigo-300">{t(`${key}Link`)}<ArrowRightIcon className="h-5 w-5 shrink-0" /></Link>
        </div>
        <figure className={`mx-auto w-full max-w-[320px] ${index % 2 ? "md:order-1" : ""}`}>
          <Image src={`/images/guides/extension/${image}.png`} alt={t(`${key}Alt`)} width={760} height={1200} sizes="(max-width: 380px) calc(100vw - 48px), 320px" className="h-auto w-full rounded-2xl border border-gray-200 shadow-xl dark:border-gray-800" />
          <figcaption className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">{t("screenshot")}</figcaption>
        </figure>
      </div>
      {key === "rules" && <div className="bg-indigo-50 dark:bg-indigo-950/30">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-14 md:grid-cols-2 lg:gap-24">
          <FeaturedArtwork art="relay-authentication" />
          <div><h2 className="text-3xl font-bold tracking-tight">{t("authTitle")}</h2>
            <p className="mt-5 leading-relaxed text-gray-600 dark:text-gray-300">{t("authBody")}</p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 font-semibold text-indigo-700 dark:text-indigo-300">
              <Link className="underline underline-offset-4" href={guide("backend-authentication")}>{t("backendLink")}</Link>
              <Link className="underline underline-offset-4" href={guide("relay-authentication")}>{t("relayLink")}</Link>
            </div>
          </div>
        </div>
      </div>}
    </section>)}
    <section className="border-y border-gray-200 dark:border-gray-800">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-8 px-6 py-12 md:flex-row md:items-center">
        <div className="max-w-2xl"><h2 className="text-2xl font-bold">{t("moreTitle")}</h2><p className="mt-3 leading-relaxed text-gray-600 dark:text-gray-300">{t("moreBody")}</p></div>
        <LinkButton href="/features" variant="outline" className="shrink-0 self-start md:self-auto">{t("moreLink")}</LinkButton>
      </div>
    </section>
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-2 lg:gap-24 lg:py-24">
      <div><h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("learnTitle")}</h2><p className="mt-5 text-lg leading-relaxed text-gray-600 dark:text-gray-300">{t("learnBody")}</p>
        <div className="mt-7 flex flex-wrap gap-3"><LinkButton href="/guides">{t("guides")}</LinkButton><ExternalLinkButton href={playlist} variant="outline">{t("watch")}</ExternalLinkButton></div>
      </div><FeaturedArtwork art="guides" />
    </section>
    <section className="bg-gray-50 dark:bg-gray-900/50">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center"><div className="max-w-2xl"><h2 className="text-2xl font-bold">{t("developersTitle")}</h2><p className="mt-3 leading-relaxed text-gray-600 dark:text-gray-300">{t("developersBody")}</p></div><LinkButton href="/docs" variant="outline" className="shrink-0 self-start md:self-auto">{t("developersLink")}</LinkButton></div>
        {getAllNews(locale as Locale).length > 0 && <Link href="/news" className="mt-8 inline-flex items-center gap-2 text-indigo-700 underline underline-offset-4 dark:text-indigo-300">{common("nav.news")}<ArrowRightIcon className="h-4 w-4" /></Link>}
        <NewsletterSection />
      </div>
    </section>
  </>;
}
export const generateMetadata = withMetadataPolicy(pageMetadata);
