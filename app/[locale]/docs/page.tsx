import { FeaturedArtwork } from '@/components/illustrations/FeaturedArtwork';
import { withMetadataPolicy } from '@/lib/metadata-policy';
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { LinkButton, ExternalLinkButton } from "@/components/ui";
import { ArrowRightIcon } from "@/components/icons";
import { generateAlternates, generateOpenGraph, generateTwitter } from "@/lib/metadata";
import { type Locale } from "@/i18n/config";

type Props = {
  params: Promise<{ locale: string }>;
};

async function pageMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("docs.meta");
  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    keywords: ["nostr wot docs", "nostr wot api"],
    alternates: generateAlternates("/docs", locale as Locale),
    openGraph: generateOpenGraph({
      title,
      description,
      path: "/docs",
      locale: locale as Locale,
    }),
    twitter: generateTwitter({ title, description }),
  };
}

export default async function DocsOverviewPage({ params }: Props) {
  await params;
  const t = await getTranslations("docs.hub");
  const entries = [
    { key: "signer", href: "/docs/extension" },
    { key: "sdk", href: "/docs/sdk" },
    { key: "oracle", href: "/docs/oracle" },
    { key: "proxy", href: "/docs/lnbits-proxy" },
  ] as const;
  return <article>
    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t("title")}</h1>
    <p className="mt-6 max-w-2xl text-xl leading-relaxed text-gray-600 dark:text-gray-300">{t("intro")}</p>
    <div className="mt-7"><LinkButton href="/docs/getting-started">{t("start")}</LinkButton></div>
    <FeaturedArtwork art="developers" className="my-10" />
    <h2 className="mb-3 text-2xl font-bold">{t("integrate")}</h2>
    <div className="divide-y divide-gray-200 border-y border-gray-200 dark:divide-gray-800 dark:border-gray-800">
      {entries.map(({key, href}) => <Link key={key} href={href} className="group flex items-center justify-between gap-6 py-6">
        <div><h3 className="text-xl font-semibold text-indigo-700 group-hover:underline dark:text-indigo-300">{t(`${key}Title`)}</h3><p className="mt-2 text-gray-600 dark:text-gray-300">{t(`${key}Body`)}</p></div>
        <ArrowRightIcon className="h-5 w-5 shrink-0" />
      </Link>)}
    </div>
    <section className="mt-12 rounded-2xl bg-indigo-50 p-6 sm:p-8 dark:bg-indigo-950/30">
      <h2 className="text-2xl font-bold">{t("contribute")}</h2>
      <p className="mt-4 leading-relaxed text-gray-600 dark:text-gray-300">{t("themeBody")}</p>
      <div className="mt-6 flex flex-wrap gap-3"><LinkButton href="/guides/create-extension-theme">{t("themeTitle")}</LinkButton><ExternalLinkButton variant="outline" href="https://github.com/nostr-wot/nostr-wot-extension/blob/main/CONTRIBUTING.md">{t("contributing")}</ExternalLinkButton></div>
    </section>
  </article>;
}

export const generateMetadata = withMetadataPolicy(pageMetadata);
