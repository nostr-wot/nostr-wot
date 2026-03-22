"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { GraphNode } from "@/lib/graph/types";
import { formatPubkey } from "@/lib/graph/transformers";

interface NodeContextMenuProps {
  node: GraphNode;
  position: { x: number; y: number };
  isExpanded: boolean;
  isExpanding?: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  onViewProfile: () => void;
  onClose: () => void;
}

export default function NodeContextMenu({
  node,
  position,
  isExpanded,
  isExpanding = false,
  onExpand,
  onCollapse,
  onViewProfile,
  onClose,
}: NodeContextMenuProps) {
  const t = useTranslations("playground");
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  // Use SDK-provided trustScore directly from the node
  const trustScore = node.trustScore;
  const canExpand = node.distance < 4 && !isExpanded;

  return (
    <div
      ref={menuRef}
      className="absolute z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden min-w-[200px] animate-in fade-in zoom-in-95 duration-150"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {/* Node info header */}
      <div className="px-4 py-3 border-b border-gray-700 bg-gray-800/80">
        <div className="font-medium text-white truncate max-w-[180px]">
          {node.label || formatPubkey(node.id)}
        </div>
        <div className="text-xs text-gray-500 font-mono truncate max-w-[180px] mt-0.5">
          {formatPubkey(node.id)}
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
          <span>{node.distance} hop{node.distance !== 1 ? "s" : ""}</span>
          <span>·</span>
          <span>{node.pathCount || 1} path{(node.pathCount || 1) !== 1 ? "s" : ""}</span>
          <span>·</span>
          <span className="text-trust-green">{Math.round(trustScore * 100)}%</span>
        </div>
      </div>

      {/* Menu options */}
      <div className="py-1">
        {/* Expand follows */}
        {canExpand && (
          <button
            onClick={() => {
              onExpand();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-200 hover:bg-gray-700/50 transition-colors"
          >
            <svg
              className="w-4 h-4 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
            <span>{t("contextMenu.expandFollows")}</span>
          </button>
        )}

        {isExpanding && (
          <div className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Expanding...</span>
          </div>
        )}

        {isExpanded && (
          <button
            onClick={() => { onCollapse(); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-200 hover:bg-gray-700/50 transition-colors"
          >
            <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
            </svg>
            <span>{t("contextMenu.collapseFollows")}</span>
          </button>
        )}

        {node.distance >= 4 && !isExpanded && (
          <div className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>{t("contextMenu.maxDepthReached")}</span>
          </div>
        )}

        {/* View profile */}
        <button
          onClick={() => {
            onViewProfile();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-200 hover:bg-gray-700/50 transition-colors"
        >
          <svg
            className="w-4 h-4 text-blue-400"
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
          <span>{t("contextMenu.viewProfile")}</span>
        </button>

        {/* Copy npub */}
        <button
          onClick={() => {
            // Copy the npub format
            const npub = node.id.startsWith("npub") ? node.id : formatPubkey(node.id).replace("...", "");
            navigator.clipboard.writeText(node.id); // Copy full hex for compatibility
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-200 hover:bg-gray-700/50 transition-colors"
        >
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <span>{t("contextMenu.copyNpub")}</span>
        </button>
      </div>
    </div>
  );
}
