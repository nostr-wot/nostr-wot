import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { generateAlternates } from "@/lib/metadata";
import { type Locale } from "@/i18n/config";
import {
  decodeNoteId,
  fetchNoteAuthorMetadata,
  fetchNostrEventById,
  type ServerNostrEvent,
} from "@/lib/server/fetchNostrEvent";
import { fetchReactionCounts } from "@/lib/server/fetchReactions";
import { hexToNpub } from "@/lib/graph/transformers";
import NoteThreadContent from "./NoteThreadContent";

interface NotePageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

type AuthorMeta = Awaited<ReturnType<typeof fetchNoteAuthorMetadata>>;

function preview(body: string, max = 157): string {
  const clean = body.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

function buildArticleJsonLd(
  event: ServerNostrEvent,
  author: AuthorMeta,
  canonicalUrl: string,
  reactionCount: number,
): Record<string, unknown> {
  const authorNpub = hexToNpub(event.pubkey);
  const authorName =
    author?.displayName?.trim() ||
    author?.name?.trim() ||
    `${authorNpub.slice(0, 12)}…`;
  const authorUrl = `https://nostr-wot.com/profile/${authorNpub}`;
  const personSchema: Record<string, unknown> = {
    "@type": "Person",
    name: authorName,
    url: authorUrl,
    identifier: authorNpub,
  };
  if (author?.picture) personSchema.image = author.picture;
  if (author?.nip05) personSchema.alternateName = author.nip05;

  const headline = preview(event.content, 110) || "Note on Nostr";
  return {
    "@context": "https://schema.org",
    "@type": "SocialMediaPosting",
    "@id": canonicalUrl,
    url: canonicalUrl,
    headline,
    articleBody: event.content,
    datePublished: new Date(event.createdAt * 1000).toISOString(),
    inLanguage: "en",
    author: personSchema,
    creator: personSchema,
    publisher: {
      "@type": "Organization",
      name: "Nostr WoT",
      url: "https://nostr-wot.com",
    },
    identifier: event.nevent,
    ...(reactionCount > 0
      ? {
          interactionStatistic: {
            "@type": "InteractionCounter",
            interactionType: "https://schema.org/LikeAction",
            userInteractionCount: reactionCount,
          },
        }
      : {}),
  };
}

export async function generateMetadata({
  params,
}: NotePageProps): Promise<Metadata> {
  const { id, locale } = await params;
  const t = await getTranslations("notes");

  const event = await fetchNostrEventById(id).catch(() => null);
  if (!event) {
    return {
      title: t("title"),
      description: t("description"),
    };
  }
  const author = await fetchNoteAuthorMetadata(event.pubkey).catch(() => null);
  const authorName =
    author?.displayName || author?.name || event.pubkey.slice(0, 12);
  const title = `${authorName} on Nostr`;
  const description = preview(event.content);
  const datePublished = new Date(event.createdAt * 1000).toISOString();

  return {
    title,
    description,
    authors: [{ name: authorName }],
    alternates: generateAlternates(`/notes/${event.nevent}`, locale as Locale),
    openGraph: {
      title,
      description,
      type: "article",
      authors: [authorName],
      publishedTime: datePublished,
      images: author?.picture ? [{ url: author.picture }] : undefined,
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: author?.picture ? [author.picture] : undefined,
    },
  };
}

export default async function NotePage({ params }: NotePageProps) {
  const { id, locale } = await params;

  const decoded = decodeNoteId(id);
  if (!decoded) notFound();

  const event = await fetchNostrEventById(id).catch(() => null);
  if (!event) notFound();

  if (id !== event.nevent) {
    redirect(`/${locale === "en" ? "" : `${locale}/`}notes/${event.nevent}`.replace(/^\/\//, "/"));
  }

  const [author, parentEvent, parentAuthor, reactionCounts] = await Promise.all([
    fetchNoteAuthorMetadata(event.pubkey).catch(() => null),
    event.parent
      ? fetchNostrEventById(event.parent.id).catch(() => null)
      : Promise.resolve(null),
    event.parent?.pubkey
      ? fetchNoteAuthorMetadata(event.parent.pubkey).catch(() => null)
      : Promise.resolve(null),
    fetchReactionCounts([event.id]).catch(() => ({}) as Record<string, number>),
  ]);

  const resolvedParentAuthor =
    parentEvent && !parentAuthor
      ? await fetchNoteAuthorMetadata(parentEvent.pubkey).catch(() => null)
      : parentAuthor;

  const canonical = `https://nostr-wot.com${locale === "en" ? "" : `/${locale}`}/notes/${event.nevent}`;
  const reactionCount = reactionCounts[event.id] ?? 0;
  const jsonLd = buildArticleJsonLd(event, author, canonical, reactionCount);

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NoteThreadContent
        event={event}
        author={author}
        parent={parentEvent}
        parentAuthor={resolvedParentAuthor}
        reactionCount={reactionCount}
      />
    </>
  );
}
