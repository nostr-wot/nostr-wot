"use client";

import { useTranslations } from "next-intl";

import { useEffect, useState, ReactNode } from "react";
import { DocsSidebar } from "./DocsSidebar";
import { TableOfContents } from "./TableOfContents";

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

interface TocItem {
  id: string;
  label: string;
  level: number;
}

interface DocsLayoutProps {
  children: ReactNode;
  sidebarSections: SidebarSection[];
  tocItems: TocItem[];
  tocTitle?: string;
}

export function DocsLayout({
  children,
  sidebarSections,
  tocItems,
  tocTitle,
}: DocsLayoutProps) {
  const t = useTranslations("docs");
  const [activeSection, setActiveSection] = useState<string>("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Get all section IDs from sidebar
    const sectionIds = sidebarSections.flatMap((s) =>
      s.links.filter((l) => l.href.startsWith("#")).map((l) => l.href.slice(1))
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-80px 0px -70% 0px",
        threshold: 0,
      }
    );

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [sidebarSections]);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      {/* Mobile menu button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          {t("labels.navigation")}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-950 transform transition-transform lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full pt-16 px-4">
          <DocsSidebar sections={sidebarSections} activeSection={activeSection} />
        </div>
      </div>

      <div className="flex gap-8">
        {/* Left sidebar - desktop */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 max-h-[calc(100vh-8rem)]">
            <DocsSidebar sections={sidebarSections} activeSection={activeSection} />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 max-w-3xl">
          <div className="prose prose-gray dark:prose-invert max-w-none">
            {children}
          </div>
        </main>

        {/* Right sidebar - table of contents */}
        <aside className="hidden xl:block w-56 flex-shrink-0">
          <div className="sticky top-24 max-h-[calc(100vh-8rem)]">
            <TableOfContents items={tocItems} title={tocTitle ?? t("sidebar.onThisPage")} />
          </div>
        </aside>
      </div>
    </div>
  );
}
