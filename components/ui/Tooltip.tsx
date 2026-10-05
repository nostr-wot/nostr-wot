'use client';

import { useEffect, useState, type ReactNode } from "react";
import { focusRing } from "./focus-ring";

interface TooltipProps {
  /** The explanation. Shown on hover and focus, and always available to assistive tech. */
  label: string;
  children: ReactNode;
  className?: string;
  side?: "top" | "bottom";
  /**
   * "self" wraps the children in a focusable span, for a trigger that is not
   * otherwise interactive, such as a status chip. "child" assumes the child is
   * already focusable, such as a link, and adds no second tab stop.
   */
  trigger?: "self" | "child";
  /**
   * Whether the bubble's text is also exposed to assistive technology. Set
   * false when the trigger already carries the same text as its accessible
   * name, which would otherwise be announced twice.
   */
  announce?: boolean;
}

/**
 * A tooltip that reveals on hover and on focus.
 *
 * The reveal is CSS, not state, so it still works with no JavaScript and
 * renders correctly in the server HTML a crawler receives. Deliberately not the
 * `title` attribute, which never appears on touch devices and is inconsistently
 * surfaced by screen readers.
 *
 * JavaScript adds exactly one thing: Escape dismisses the bubble, which
 * WCAG 1.4.13 requires of any content shown on hover or focus. That cannot be
 * done in CSS, and a tooltip covering the thing you were trying to read with no
 * way to get rid of it is the problem the criterion exists for. The listener is
 * attached only while the tooltip is actually showing, so there is no
 * document-level handler sitting on every page.
 *
 * The bubble stays `aria-hidden` with its text duplicated as screen-reader text
 * on the trigger, so a dismissed bubble never removes information from
 * assistive technology: it was reading the trigger's accessible name, not the
 * bubble.
 *
 * It also stays `pointer-events-none`, which means the pointer cannot travel
 * onto it (the third part of 1.4.13). That is deliberate: the bubble overlaps
 * whatever sits above the trigger, and giving it pointer events made it swallow
 * clicks aimed at the content underneath. Since its text is already on the
 * trigger, there is nothing in the bubble a reader can only get by hovering it.
 */
export function Tooltip({ label, children, className = "", side = "top", trigger = "self", announce = true }: TooltipProps) {
  const place = side === "top" ? "bottom-full mb-2" : "top-full mt-2";
  const [showing, setShowing] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!showing || dismissed) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setDismissed(true);
      // Not stopped or prevented: Escape may also mean something to a dialog or
      // a menu further up, and dismissing a tooltip is not a reason to swallow
      // it.
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [showing, dismissed]);

  // Leaving and coming back is a fresh showing, so a dismissal never sticks.
  const open = () => setShowing(true);
  const close = () => { setShowing(false); setDismissed(false); };

  return (
    <span
      className={`group/tip relative inline-flex items-center ${className}`}
      onMouseEnter={open}
      onMouseLeave={close}
      onFocus={open}
      onBlur={event => {
        // Only when focus actually leaves the tooltip, not when it moves
        // between the trigger and something inside it.
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) close();
      }}
    >
      {trigger === "self" ? (
        <span tabIndex={0} className={`inline-flex items-center rounded ${focusRing}`}>
          {children}
          {/* Inside the focusable element on purpose: it becomes part of that
              element's accessible name, so focusing the chip announces the
              explanation rather than leaving it as loose adjacent text. */}
          {announce && <span className="sr-only"> {label}</span>}
        </span>
      ) : (
        <>
          {children}
          {/* For an already-focusable child the note sits beside it. The child
              owns its own accessible name, so pass announce={false} when the
              note repeats it. */}
          {announce && <span className="sr-only"> {label}</span>}
        </>
      )}
      {/* aria-hidden so the text is not announced twice, and pointer-events-none
          so the bubble never swallows a click aimed at whatever is beneath it. */}
      <span
        aria-hidden="true"
        {...(dismissed ? { style: { opacity: 0, visibility: 'hidden' as const } } : {})}
        className={`pointer-events-none absolute left-1/2 z-30 w-max max-w-64 -translate-x-1/2 ${place} translate-y-1 scale-95 rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-xs font-normal normal-case leading-relaxed text-gray-600 opacity-0 shadow-xl transition duration-150 ease-out group-hover/tip:translate-y-0 group-hover/tip:scale-100 group-hover/tip:opacity-100 group-focus-within/tip:translate-y-0 group-focus-within/tip:scale-100 group-focus-within/tip:opacity-100 motion-reduce:transition-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300`}
      >
        {label}
      </span>
    </span>
  );
}
