import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ProfilePageContent from "./ProfilePageContent";
import { generateAlternates } from "@/lib/metadata";
import { type Locale } from "@/i18n/config";
import { fetchNostrProfileMetadata, type ServerProfileMetadata } from "@/lib/server/fetchNostrMetadata";
import { hexToNpub } from "@/lib/graph/transformers";

interface ProfilePageProps {
  params: Promise<{
    locale: string;
    pubkey: string;
  }>;
}

function shortenNpub(npub: string): string {
  return `${npub.slice(0, 12)}…${npub.slice(-6)}`;
}

function buildPersonJsonLd(
  initial: ServerProfileMetadata | null,
  npub: string,
  canonicalUrl: string,
): Record<string, unknown> {
  const name =
    initial?.displayName?.trim() ||
    initial?.name?.trim() ||
    shortenNpub(npub);
  const sameAs: string[] = [];
  if (initial?.nip05) sameAs.push(`nostr:${npub}`);
  if (initial?.website) sameAs.push(initial.website);
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    ...(initial?.about ? { description: initial.about } : {}),
    ...(initial?.picture ? { image: initial.picture } : {}),
    url: canonicalUrl,
    identifier: npub,
    ...(initial?.nip05 ? { alternateName: initial.nip05 } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
    ...(initial?.followCount !== null && initial?.followCount !== undefined
      ? {
          interactionStatistic: {
            "@type": "InteractionCounter",
            interactionType: "https://schema.org/FollowAction",
            userInteractionCount: initial.followCount,
          },
        }
      : {}),
  };
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { pubkey, locale } = await params;
  const t = await getTranslations("profile");

  const initial = await fetchNostrProfileMetadata(pubkey).catch(() => null);
  const npub = pubkey.startsWith("npub") ? pubkey : hexToNpub(pubkey);
  const name = initial?.displayName || initial?.name || shortenNpub(npub);

  const title = `${name} — ${t("title")}`;
  const description =
    initial?.about?.slice(0, 157) ||
    `${name} on Nostr. ${t("description")}`;

  return {
    title,
    description,
    authors: [{ name }],
    alternates: generateAlternates(`/profile/${pubkey}`, locale as Locale),
    openGraph: {
      title,
      description,
      type: "profile",
      ...(initial?.name ? { username: initial.name } : {}),
      images: initial?.picture ? [{ url: initial.picture }] : undefined,
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: initial?.picture ? [initial.picture] : undefined,
    },
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { pubkey, locale } = await params;
  const initialProfile = await fetchNostrProfileMetadata(pubkey).catch(
    () => null,
  );
  const npub = pubkey.startsWith("npub") ? pubkey : hexToNpub(pubkey);
  const canonical = `https://nostr-wot.com${locale === "en" ? "" : `/${locale}`}/profile/${npub}`;
  const jsonLd = buildPersonJsonLd(initialProfile, npub, canonical);

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProfilePageContent pubkey={pubkey} initialProfile={initialProfile} />
    </>
  );
}
