import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { generateAlternates, generateOpenGraph, generateTwitter } from "@/lib/metadata";
import { type Locale } from "@/i18n/config";
import ChatContent from "./ChatContent";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("pqcChat.meta");
  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    keywords: ["post-quantum nostr chat", "ml-kem messaging", "encrypted nostr dm"],
    alternates: generateAlternates("/pqc/chat", locale as Locale),
    openGraph: generateOpenGraph({ title, description, path: "/pqc/chat", locale: locale as Locale }),
    twitter: generateTwitter({ title, description }),
  };
}

export default function PqcChatPage() {
  return <ChatContent />;
}
