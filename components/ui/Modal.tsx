"use client";

import { useEffect, useRef, type ReactNode } from "react";

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
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    // aria-modal tells a screen reader the rest of the page is not there, so Tab has to
    // agree with it. Without a trap the two disagree and the dialog becomes a maze.
    const focusable = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter(el => el.offsetParent !== null);

    const opener = document.activeElement as HTMLElement | null;
    focusable()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const items = focusable();
      if (items.length === 0) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      const active = document.activeElement;

      if (e.shiftKey && (active === first || !panelRef.current?.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      // Back where they came from, so closing does not dump focus at the top of the page.
      opener?.focus?.();
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
        ref={panelRef}
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
