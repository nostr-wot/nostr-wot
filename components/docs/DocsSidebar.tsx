"use client";

import { Link } from "@/i18n/routing";
import { useState } from "react";

interface SidebarLink {
  href: string;
  label: string;
  isInternal?: boolean;
}

interface SidebarSection {
  title: string;
  key: string;
  links: SidebarLink[];
}

interface DocsSidebarProps {
  sections: SidebarSection[];
  activeSection?: string;
}

export function DocsSidebar({ sections, activeSection }: DocsSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.map((s) => s.key))
  );

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const isActive = (href: string) => {
    if (!activeSection) return false;
    return href === `#${activeSection}`;
  };

  return (
    <nav className="h-full overflow-y-auto pr-4 pb-8">
      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.key}>
            <button
              onClick={() => toggleSection(section.key)}
              className="flex items-center justify-between w-full text-left font-semibold text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-2"
            >
              <span>{section.title}</span>
              <svg
                className={`w-4 h-4 transition-transform ${
                  expandedSections.has(section.key) ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {expandedSections.has(section.key) && (
              <ul className="space-y-1 ml-2 border-l border-gray-200 dark:border-gray-700 pl-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    {link.isInternal ? (
                      <Link
                        href={link.href}
                        className={`block py-1 text-sm transition-colors ${
                          isActive(link.href)
                            ? "text-primary font-medium"
                            : "text-gray-600 dark:text-gray-400 hover:text-primary"
                        }`}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className={`block py-1 text-sm transition-colors ${
                          isActive(link.href)
                            ? "text-primary font-medium"
                            : "text-gray-600 dark:text-gray-400 hover:text-primary"
                        }`}
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}
