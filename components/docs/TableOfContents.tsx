"use client";

import { useTranslations } from "next-intl";

import { useEffect, useState } from "react";

interface TocItem {
  id: string;
  label: string;
  level: number;
}

interface TableOfContentsProps {
  items: TocItem[];
  title?: string;
  headingLevel?: 2 | 3 | 4;
}

export function TableOfContents({ items, title, headingLevel = 4 }: TableOfContentsProps) {
  const t = useTranslations("docs");
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const sections = items.map(item => ({ id: item.id, element: document.getElementById(item.id) })).filter(item => item.element);
      const passed = sections.filter(item => item.element!.getBoundingClientRect().top <= 120);
      setActiveId(passed.at(-1)?.id ?? sections[0]?.id ?? "");
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav className="h-full overflow-y-auto pl-4 pb-8">
      <Heading className="font-semibold text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
        {title ?? t("sidebar.onThisPage")}
      </Heading>
      <ul className="space-y-2 border-l border-gray-200 dark:border-gray-700">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={activeId === item.id ? "location" : undefined}
              className={`block w-full text-left text-sm py-1 transition-colors ${
                item.level === 2 ? "pl-3" : "pl-6"
              } ${
                activeId === item.id
                  ? "text-primary font-medium border-l-2 border-primary -ml-px"
                  : "text-gray-600 dark:text-gray-400 hover:text-primary"
              }`}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
