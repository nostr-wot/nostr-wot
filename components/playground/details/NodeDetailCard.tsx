"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { GraphNode, NodeProfile } from "@/lib/graph/types";
import { getTrustClass, getTrustLabel } from "@/lib/graph/colors";
import { formatPubkey } from "@/lib/graph/transformers";
import { Badge, Button } from "@/components/ui";

interface NodeDetailCardProps {
  node: GraphNode;
  profile?: NodeProfile;
  onExpand?: () => void;
  onViewProfile?: () => void;
}

export default function NodeDetailCard({
  node,
  profile,
  onExpand,
  onViewProfile,
}: NodeDetailCardProps) {
  const t = useTranslations("playground");
  const [copied, setCopied] = useState(false);

  const trustClass = getTrustClass(node.trustScore);
  const trustLabel = getTrustLabel(node.trustScore);

  const handleCopyPubkey = async () => {
    try {
      await navigator.clipboard.writeText(node.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="p-4">
      {/* Profile header */}
      <div className="flex items-start gap-4">
        {/* Avatar */}
        {node.picture || profile?.picture ? (
          <img
            src={node.picture || profile?.picture}
            alt={`${profile?.displayName || profile?.name || node.label || "User"} avatar`}
            className="w-16 h-16 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl text-gray-400">
              {(node.label || "?")[0].toUpperCase()}
            </span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Name */}
          <h3 className="text-lg font-semibold text-white truncate">
            {profile?.displayName || profile?.name || node.label || "Unknown"}
          </h3>

          {/* NIP-05 */}
          {profile?.nip05 && (
            <p className="text-sm text-primary truncate">{profile.nip05}</p>
          )}

          {/* Pubkey with copy feedback */}
          <button
            onClick={handleCopyPubkey}
            className={`flex items-center gap-1.5 text-xs font-mono transition-colors mt-1 ${
              copied ? "text-emerald-400" : "text-gray-500 hover:text-gray-300"
            }`}
            aria-label={t("graph.copyNpub")}
          >
            {copied ? (
              <>
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>{t("graph.copied")}</span>
              </>
            ) : (
              <>
                {formatPubkey(node.id)}
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 flex flex-wrap gap-2">
        {/* Trust score */}
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${trustClass}`}>
          {Math.round(node.trustScore * 100)}% {trustLabel}
        </span>

        {/* Distance */}
        {node.isRoot ? (
          <Badge variant="primary">{t("graph.you")}</Badge>
        ) : (
          <Badge variant="neutral">
            {node.distance} {node.distance === 1 ? "hop" : "hops"}
          </Badge>
        )}

        {/* Path count */}
        {!node.isRoot && node.pathCount > 1 && (
          <Badge variant="neutral">
            {node.pathCount} {node.pathCount === 1 ? "path" : "paths"}
          </Badge>
        )}

        {/* Mutual */}
        {node.isMutual && <Badge variant="success">{t("graph.mutual")}</Badge>}
      </div>

      {/* About */}
      {profile?.about && (
        <div className="mt-4">
          <p className="text-sm text-gray-400 line-clamp-3">{profile.about}</p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 space-y-2">
        {/* Quick view modal button */}
        <Button
          variant="primary"
          size="sm"
          onClick={onViewProfile}
          className="w-full"
        >
          <span className="flex items-center justify-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            {t("graph.viewProfile")}
          </span>
        </Button>

        <div className="flex gap-2">
          {!node.isRoot && node.distance < 3 && (
            <Button variant="secondary" size="sm" onClick={onExpand}>
              {t("graph.expandNode")}
            </Button>
          )}

          {/* Full profile page link - opens in new tab */}
          <Link href={`/profile/${node.id}`} target="_blank" className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <span className="flex items-center justify-center gap-1.5">
                {t("graph.viewFullProfile")}
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
