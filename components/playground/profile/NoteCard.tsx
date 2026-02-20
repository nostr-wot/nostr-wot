"use client";

import { useMemo } from "react";
import { Link } from "@/i18n/routing";
import { NostrNote } from "@/lib/graph/types";

interface NoteCardProps {
  note: NostrNote;
}

/**
 * Format timestamp to relative time
 */
function formatRelativeTime(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;

  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

/**
 * Check if note is a reply or mention
 */
function getNoteType(tags: string[][]): { isReply: boolean; isMention: boolean } {
  let isReply = false;
  let isMention = false;

  for (const tag of tags) {
    if (tag[0] === "e") {
      isReply = true;
    }
    if (tag[0] === "p") {
      isMention = true;
    }
  }

  return { isReply, isMention };
}

/**
 * Individual note card component
 */
export default function NoteCard({ note }: NoteCardProps) {
  const relativeTime = useMemo(
    () => formatRelativeTime(note.created_at),
    [note.created_at]
  );

  const { isReply, isMention } = useMemo(
    () => getNoteType(note.tags),
    [note.tags]
  );

  return (
    <div className="p-4 bg-gray-700/30 hover:bg-gray-700/50 rounded-lg transition-colors">
      {/* Note indicators */}
      {(isReply || isMention) && (
        <div className="flex gap-2 mb-2">
          {isReply && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
              Reply
            </span>
          )}
          {isMention && !isReply && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Mention
            </span>
          )}
        </div>
      )}

      {/* Note content */}
      <p className="text-sm text-gray-200 whitespace-pre-wrap break-words line-clamp-6">
        {note.content}
      </p>

      {/* Timestamp */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-500">{relativeTime}</span>

        {/* View author profile */}
        <Link
          href={`/profile/${note.pubkey}`}
          target="_blank"
          className="text-xs text-gray-500 hover:text-primary transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
