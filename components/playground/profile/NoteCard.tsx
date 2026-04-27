"use client";

import { useMemo } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { nip19 } from "nostr-tools";
import { NostrNote } from "@/lib/graph/types";
import type { ParentRef } from "@/lib/client/noteEnrichments";

interface NoteCardProps {
  note: NostrNote;
  parent?: ParentRef | undefined;
  reactionCount?: number;
}

function formatRelativeTime(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(timestamp * 1000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

function parseContent(content: string): { text: string; images: string[] } {
  const images: string[] = [];
  const text = content
    .replace(URL_REGEX, (url) => {
      if (IMAGE_EXTENSIONS.test(url)) {
        images.push(url);
        return "";
      }
      return url;
    })
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return { text, images };
}

function neventOf(note: NostrNote): string {
  try {
    return nip19.neventEncode({ id: note.id, author: note.pubkey, kind: note.kind });
  } catch {
    return note.id;
  }
}

export default function NoteCard({ note, parent, reactionCount }: NoteCardProps) {
  const t = useTranslations("notes");
  const relativeTime = useMemo(
    () => formatRelativeTime(note.created_at),
    [note.created_at],
  );
  const { text, images } = useMemo(() => parseContent(note.content), [note.content]);
  const nevent = useMemo(() => neventOf(note), [note]);

  return (
    <article className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-primary/40 dark:hover:border-primary/40 transition-colors">
      {parent && (
        <Link
          href={`/notes/${parent.nevent}`}
          className="block px-4 pt-3 pb-2 border-b border-gray-100 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
        >
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            <span className="truncate">
              {t("replyingTo")}{" "}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {parent.authorName}
              </span>
            </span>
          </div>
          {parent.preview && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
              {parent.preview}
            </p>
          )}
        </Link>
      )}

      <Link
        href={`/notes/${nevent}`}
        className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors"
      >
        {text && (
          <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words line-clamp-6">
            {text}
          </p>
        )}

        {images.length > 0 && (
          <div className={`mt-3 grid gap-1.5 ${images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
            {images.slice(0, 3).map((src, i) => (
              <span key={i} className="block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt="note media"
                  className="w-full h-40 object-cover rounded-lg bg-gray-200 dark:bg-gray-700"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </span>
            ))}
            {images.length > 3 && (
              <div className="h-40 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm text-gray-500">
                +{images.length - 3}
              </div>
            )}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{relativeTime}</span>
          {typeof reactionCount === "number" && (
            <span className="inline-flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span>{reactionCount}</span>
            </span>
          )}
        </div>
      </Link>
    </article>
  );
}
