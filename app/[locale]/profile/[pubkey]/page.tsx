import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ProfilePageContent from "./ProfilePageContent";
import { generateAlternates } from "@/lib/metadata";
import { type Locale } from "@/i18n/config";
import { fetchNostrProfileMetadata } from "@/lib/server/fetchNostrMetadata";
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
    alternates: generateAlternates(`/profile/${pubkey}`, locale as Locale),
    openGraph: {
      title,
      description,
      type: "profile",
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
  const { pubkey } = await params;
  const initialProfile = await fetchNostrProfileMetadata(pubkey).catch(
    () => null,
  );

  return <ProfilePageContent pubkey={pubkey} initialProfile={initialProfile} />;
}
