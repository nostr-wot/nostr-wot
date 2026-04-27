import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { generateAlternates } from "@/lib/metadata";
import { type Locale } from "@/i18n/config";
import {
  decodeNoteId,
  fetchNoteAuthorMetadata,
  fetchNostrEventById,
} from "@/lib/server/fetchNostrEvent";
import { fetchReactionCounts } from "@/lib/server/fetchReactions";
import NoteThreadContent from "./NoteThreadContent";

interface NotePageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

function preview(body: string, max = 157): string {
  const clean = body.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
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
  const authorName = author?.displayName || author?.name || event.pubkey.slice(0, 12);
  const title = `${authorName} on Nostr`;
  const description = preview(event.content);

  return {
    title,
    description,
    alternates: generateAlternates(`/notes/${event.nevent}`, locale as Locale),
    openGraph: {
      title,
      description,
      type: "article",
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

  return (
    <NoteThreadContent
      event={event}
      author={author}
      parent={parentEvent}
      parentAuthor={resolvedParentAuthor}
      reactionCount={reactionCounts[event.id] ?? 0}
    />
  );
}
