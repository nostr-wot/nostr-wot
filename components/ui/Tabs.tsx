"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { focusRing } from "./focus-ring";

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

/**
 * An accessible tab set following the ARIA tabs pattern: one tab stop for the
 * whole list, arrow keys to move between tabs, and Home/End to jump to the
 * ends. Selection follows focus, which suits panels that are already rendered.
 *
 * Every panel stays in the document and is hidden with the `hidden` attribute
 * rather than being unmounted, so all of the content is still present in the
 * HTML a crawler receives. Only its visibility changes.
 */
export function Tabs({ items, label, className = "" }: { items: TabItem[]; label: string; className?: string }) {
  const [active, setActive] = useState(items[0]?.id);
  const base = useId();
  const tabs = useRef<Record<string, HTMLButtonElement | null>>({});
  const ids = items.map(item => item.id);

  const focus = (id: string) => {
    setActive(id);
    tabs.current[id]?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const index = ids.indexOf(active);
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const delta = event.key === "ArrowRight" ? 1 : -1;
      focus(ids[(index + delta + ids.length) % ids.length]);
    } else if (event.key === "Home") {
      event.preventDefault();
      focus(ids[0]);
    } else if (event.key === "End") {
      event.preventDefault();
      focus(ids[ids.length - 1]);
    }
  };

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="flex flex-wrap gap-1 border-b border-gray-200 dark:border-gray-800"
      >
        {items.map(item => {
          const selected = item.id === active;
          return (
            <button
              key={item.id}
              ref={node => {
                tabs.current[item.id] = node;
              }}
              type="button"
              role="tab"
              id={`${base}-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`${base}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(item.id)}
              className={`-mb-px rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${focusRing} ${
                selected
                  // primary is 4.27:1 on the light page background, under the 4.5:1 bar for
                  // this size; primary-dark clears it and the border keeps the indicator.
                  ? "border-primary text-primary-dark dark:text-primary"
                  : "border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-white"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map(item => {
        const selected = item.id === active;
        return (
          <div
            key={item.id}
            role="tabpanel"
            id={`${base}-panel-${item.id}`}
            aria-labelledby={`${base}-tab-${item.id}`}
            tabIndex={0}
            hidden={!selected}
            className="pt-6 outline-none"
          >
            {/* A CSS entrance keyed to the tab, so switching replays it while
                the panel's resting state stays visible in the server-rendered
                HTML. ScrollReveal would have shipped the first panel as inline
                opacity:0. */}
            {selected ? <div key={item.id} className="reveal-in">{item.content}</div> : item.content}
          </div>
        );
      })}
    </div>
  );
}
