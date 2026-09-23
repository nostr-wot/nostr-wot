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
}

export function TableOfContents({ items, title }: TableOfContentsProps) {
  const t = useTranslations("docs");
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first visible entry
        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (visibleEntry) {
          setActiveId(visibleEntry.target.id);
        }
      },
      {
        rootMargin: "-80px 0px -70% 0px",
        threshold: 0,
      }
    );

    // Observe all section headers
    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [items]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  if (items.length === 0) return null;

  return (
    <nav className="h-full overflow-y-auto pl-4 pb-8">
      <h4 className="font-semibold text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
        {title ?? t("sidebar.onThisPage")}
      </h4>
      <ul className="space-y-2 border-l border-gray-200 dark:border-gray-700">
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => handleClick(item.id)}
              className={`block w-full text-left text-sm py-1 transition-colors ${
                item.level === 2 ? "pl-3" : "pl-6"
              } ${
                activeId === item.id
                  ? "text-primary font-medium border-l-2 border-primary -ml-px"
                  : "text-gray-600 dark:text-gray-400 hover:text-primary"
              }`}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
