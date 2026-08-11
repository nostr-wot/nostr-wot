"use client";

import { useEffect, type ReactNode } from "react";

/**
 * A dialog overlay: escape to close, click-outside to close, body scroll locked.
 *
 * Shared so the event explorer and the profile checker behave identically — two dialogs
 * that dismiss differently is the kind of small inconsistency people feel without being
 * able to name.
 */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  closeLabel,
  footer,
  size = "lg",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  closeLabel: string;
  footer?: ReactNode;
  size?: "lg" | "xl";
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-2 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`flex max-h-full w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-950 ${
          size === "xl" ? "max-w-6xl" : "max-w-2xl"
        }`}
      >
        <header className="flex items-center justify-between gap-4 border-b border-gray-200 p-4 dark:border-gray-800">
          <div className="min-w-0">
            <h2 className="font-semibold text-gray-900 dark:text-white">{title}</h2>
            {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {closeLabel}
          </button>
        </header>

        {children}

        {footer}
      </div>
    </div>
  );
}
