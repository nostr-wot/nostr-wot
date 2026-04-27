"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { hexToNpub } from "@/lib/graph/transformers";
import { buildNeventFromEvent } from "@/lib/server/fetchNostrEvent";
import type { ServerNostrEvent } from "@/lib/server/fetchNostrEvent";

type AuthorMeta = {
  pubkey: string;
  displayName: string | null;
  name: string | null;
  picture: string | null;
  nip05: string | null;
} | null;

interface Props {
  event: ServerNostrEvent;
  author: AuthorMeta;
  parent: ServerNostrEvent | null;
  parentAuthor: AuthorMeta;
  reactionCount: number;
}

const IMAGE_RE = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;
const URL_RE = /(https?:\/\/[^\s]+)/g;

function parseContent(content: string): { text: string; images: string[] } {
  const images: string[] = [];
  const text = content
    .replace(URL_RE, (url) => {
      if (IMAGE_RE.test(url)) {
        images.push(url);
        return "";
      }
      return url;
    })
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return { text, images };
}

function formatRelativeTime(ts: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - ts;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(ts * 1000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function authorDisplay(author: AuthorMeta, fallbackPubkey: string): string {
  return (
    author?.displayName?.trim() ||
    author?.name?.trim() ||
    `${fallbackPubkey.slice(0, 12)}…`
  );
}

export default function NoteThreadContent({
  event,
  author,
  parent,
  parentAuthor,
  reactionCount,
}: Props) {
  const t = useTranslations("notes");
  const { text, images } = useMemo(() => parseContent(event.content), [event.content]);
  const authorName = authorDisplay(author, event.pubkey);
  const npub = hexToNpub(event.pubkey);

  const parentNevent = parent ? buildNeventFromEvent({
    id: parent.id,
    pubkey: parent.pubkey,
    kind: 1,
    created_at: parent.createdAt,
    content: parent.content,
    tags: parent.tags,
    sig: "",
  }) : null;

  const parentName = parentAuthor ? authorDisplay(parentAuthor, parent?.pubkey ?? "") : null;
  const parentPreview = parent ? parseContent(parent.content) : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {parent && (
          <Link
            href={`/notes/${parentNevent}`}
            className="block mb-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17l-5-5 5-5" />
              </svg>
              <span>
                {t("replyingTo")}{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {parentName ?? "…"}
                </span>
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {parentPreview?.text || (parentPreview?.images.length ? `[${parentPreview.images.length} image]` : "")}
            </p>
          </Link>
        )}

        <article className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <header className="flex items-start gap-3 mb-4">
            {author?.picture ? (
              <Image
                src={author.picture}
                alt={`${authorName} avatar`}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover bg-gray-200 dark:bg-gray-700"
                unoptimized
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-lg font-semibold text-gray-500">
                {authorName[0]?.toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <Link
                href={`/profile/${npub}`}
                className="font-semibold text-gray-900 dark:text-white hover:text-primary transition-colors"
              >
                {authorName}
              </Link>
              {author?.nip05 && (
                <p className="text-xs text-primary truncate">{author.nip05}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatRelativeTime(event.createdAt)}
              </p>
            </div>
          </header>

          {text && (
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
              {text}
            </p>
          )}

          {images.length > 0 && (
            <div className={`mt-4 grid gap-2 ${images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
              {images.slice(0, 4).map((src, i) => (
                <a key={i} href={src} target="_blank" rel="noopener noreferrer" className="block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt="note media"
                    className="w-full h-56 object-cover rounded-lg bg-gray-200 dark:bg-gray-700"
                    loading="lazy"
                  />
                </a>
              ))}
            </div>
          )}

          <footer className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span>{reactionCount}</span>
              <span className="text-xs text-gray-500">{t("reactions")}</span>
            </div>

            <a
              href={`https://njump.me/${event.nevent}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 hover:text-primary transition-colors flex items-center gap-1"
            >
              {t("openInClient")}
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 4h6m0 0v6m0-6L10 14M4 10v10h10" />
              </svg>
            </a>
          </footer>
        </article>

        <div className="mt-6 flex items-center justify-center">
          <Link
            href={`/profile/${npub}`}
            className="text-sm text-gray-500 hover:text-primary transition-colors"
          >
            ← {t("backToProfile", { name: authorName })}
          </Link>
        </div>
      </div>
    </div>
  );
}
