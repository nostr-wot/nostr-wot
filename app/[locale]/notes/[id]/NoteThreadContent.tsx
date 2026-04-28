"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useWoTContext } from "nostr-wot-sdk/react";
import { hexToNpub } from "@/lib/graph/transformers";
import { buildNeventFromEvent } from "@/lib/server/fetchNostrEvent";
import type { ServerNostrEvent } from "@/lib/server/fetchNostrEvent";
import { fetchThread, type ThreadReply } from "@/lib/client/threadFetch";
import { useEngagement, useEngagementBatch } from "nostr-wot-sdk/react";

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

function formatSats(n: number): string {
  if (n < 1000) return `${n}`;
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10000 ? 1 : 0).replace(/\.0$/, "")}k`;
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
}

function NoteEngagementFooter({
  noteId,
  ssrReactionCount,
}: { noteId: string; ssrReactionCount: number }) {
  const t = useTranslations("notes");
  const live = useEngagement(noteId);
  // Prefer the live count once it's been populated; fall back to the SSR
  // count for the first paint so crawlers see a number.
  const reactionCount = Math.max(live.reactionCount, ssrReactionCount);
  return (
    <footer className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
      <span className="inline-flex items-center gap-1.5" title={t("reactions")}>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        <span>{reactionCount}</span>
      </span>
      {live.repostCount > 0 && (
        <span className="inline-flex items-center gap-1.5" title={t("reposts")}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{live.repostCount}</span>
        </span>
      )}
      {live.zapTotalSats > 0 && (
        <span className="inline-flex items-center gap-1.5 text-yellow-600 dark:text-yellow-400" title={t("zaps")}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
          </svg>
          <span>{formatSats(live.zapTotalSats)}</span>
        </span>
      )}
    </footer>
  );
}

function ReplyCard({ reply }: { reply: ThreadReply }) {
  const { text, images } = useMemo(() => parseContent(reply.content), [reply.content]);
  const authorName = authorDisplay(reply.author, reply.pubkey);
  const npub = hexToNpub(reply.pubkey);

  return (
    <article className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-primary/40 dark:hover:border-primary/40 transition-colors">
      <Link href={`/notes/${reply.nevent}`} className="block p-4">
        <header className="flex items-center gap-3 mb-3">
          {reply.author?.picture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={reply.author.picture}
              alt={`${authorName} avatar`}
              className="w-9 h-9 rounded-full object-cover bg-gray-200 dark:bg-gray-700"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-semibold text-gray-500">
              {authorName[0]?.toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <span className="font-semibold text-sm text-gray-900 dark:text-white truncate block">
              {authorName}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatRelativeTime(reply.createdAt)}
            </span>
          </div>
          <Link
            href={`/profile/${npub}`}
            className="text-xs text-gray-400 hover:text-primary transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            profile
          </Link>
        </header>

        {text && (
          <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words line-clamp-6">
            {text}
          </p>
        )}

        {images.length > 0 && (
          <div className={`mt-2 grid gap-1.5 ${images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
            {images.slice(0, 2).map((src, i) => (
              <span key={i} className="block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt="reply media"
                  className="w-full h-32 object-cover rounded-lg bg-gray-200 dark:bg-gray-700"
                  loading="lazy"
                />
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span>{reply.reactionCount}</span>
        </div>
      </Link>
    </article>
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
  const { wot, isReady: isWotReady } = useWoTContext();

  const { text, images } = useMemo(() => parseContent(event.content), [event.content]);
  const authorName = authorDisplay(author, event.pubkey);
  const npub = hexToNpub(event.pubkey);

  const parentNevent = parent
    ? buildNeventFromEvent({ id: parent.id, pubkey: parent.pubkey, kind: 1 })
    : null;

  const parentName = parentAuthor ? authorDisplay(parentAuthor, parent?.pubkey ?? "") : null;
  const parentPreview = parent ? parseContent(parent.content) : null;

  // Thread state
  const [thread, setThread] = useState<ThreadReply[] | null>(null);
  const [loadingThread, setLoadingThread] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [trustByPubkey, setTrustByPubkey] = useState<Record<string, number | null>>({});

  // Kick engagement fetch for the main note immediately on mount so the
  // footer shows live counts even before the user clicks "Load full thread".
  useEngagementBatch(useMemo(() => [event.id], [event.id]));

  const loadThread = useCallback(async () => {
    setLoadingThread(true);
    try {
      const result = await fetchThread(event.id);
      setThread(result.replies);
    } catch {
      setThread([]);
    } finally {
      setLoadingThread(false);
    }
  }, [event.id]);

  // Resolve trust scores once we have replies and a wot instance
  useEffect(() => {
    if (!thread || !isWotReady || !wot || thread.length === 0) return;
    const pubkeys = [...new Set(thread.map((r) => r.pubkey))];
    const missing = pubkeys.filter((p) => !(p in trustByPubkey));
    if (missing.length === 0) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await wot.getDistanceBatch(missing, { includeScores: false });
        if (cancelled) return;
        const next: Record<string, number | null> = {};
        for (const p of missing) {
          const r = res[p] as { hops: number } | null | undefined;
          next[p] = r && typeof r.hops === "number" ? r.hops : null;
        }
        setTrustByPubkey((prev) => ({ ...prev, ...next }));
      } catch {
        // ignore — fall back to non-WoT view
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [thread, isWotReady, wot, trustByPubkey]);

  const sortedReplies = useMemo(() => {
    if (!thread) return [];
    if (!isWotReady) return thread;
    const inWot: ThreadReply[] = [];
    const outWot: ThreadReply[] = [];
    for (const r of thread) {
      const dist = trustByPubkey[r.pubkey];
      if (typeof dist === "number") inWot.push(r);
      else outWot.push(r);
    }
    inWot.sort((a, b) => (trustByPubkey[a.pubkey] ?? 99) - (trustByPubkey[b.pubkey] ?? 99));
    return showAll ? [...inWot, ...outWot] : inWot;
  }, [thread, isWotReady, trustByPubkey, showAll]);

  const wotMode = isWotReady && thread !== null;
  const outsideWotCount = wotMode
    ? thread!.filter((r) => typeof trustByPubkey[r.pubkey] !== "number").length
    : 0;

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
              {parentPreview?.text ||
                (parentPreview?.images.length ? `[${parentPreview.images.length} image]` : "")}
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

          <NoteEngagementFooter
            noteId={event.id}
            ssrReactionCount={reactionCount}
          />
        </article>

        {/* Thread loader */}
        <section className="mt-6">
          {!thread && (
            <button
              onClick={loadThread}
              disabled={loadingThread}
              className="w-full py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary/40 hover:bg-primary/5 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50"
            >
              {loadingThread ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  {t("loadingThread")}
                </span>
              ) : (
                t("loadFullThread")
              )}
            </button>
          )}

          {thread && thread.length === 0 && (
            <p className="text-center text-sm text-gray-500 py-6">{t("noReplies")}</p>
          )}

          {thread && thread.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>
                  {thread.length} {thread.length === 1 ? t("reply") : t("replies")}
                  {wotMode && (
                    <>
                      {" · "}
                      {t("wotFiltered")}
                    </>
                  )}
                </span>
                {wotMode && outsideWotCount > 0 && (
                  <button
                    onClick={() => setShowAll((v) => !v)}
                    className="text-primary hover:underline"
                  >
                    {showAll ? t("showWotOnly") : t("showAll", { count: outsideWotCount })}
                  </button>
                )}
              </div>

              {sortedReplies.map((r) => (
                <ReplyCard key={r.id} reply={r} />
              ))}

              {!showAll && wotMode && sortedReplies.length === 0 && outsideWotCount > 0 && (
                <button
                  onClick={() => setShowAll(true)}
                  className="w-full py-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 text-sm text-gray-500 hover:border-primary hover:text-primary transition-colors"
                >
                  {t("noWotReplies", { count: outsideWotCount })}
                </button>
              )}
            </div>
          )}
        </section>

        <div className="mt-8 flex items-center justify-center">
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
