"use client";

import { useTranslations } from "next-intl";

import { ReactNode, useEffect, useState } from "react";
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

interface DocsClientWrapperProps {
  children: ReactNode;
  sidebarSections: SidebarSection[];
  tocItems: TocItem[];
  tocTitle?: string;
}

export function DocsClientWrapper({
  children,
  sidebarSections,
  tocItems,
  tocTitle,
}: DocsClientWrapperProps) {
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
        rootMargin: "-100px 0px -60% 0px",
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

  // Close mobile menu on navigation
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "A" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [isMobileMenuOpen]);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      {/* Mobile menu button */}
      <div className="lg:hidden mb-4 sticky top-16 z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm -mx-4 px-4 py-2">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          {t("labels.documentationMenu")}
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
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-950 shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <span className="font-semibold">{t("labels.navigation")}</span>
          <button
            aria-label={t("labels.closeNavigation")}
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="h-[calc(100%-60px)] overflow-y-auto p-4">
          <DocsSidebar sections={sidebarSections} activeSection={activeSection} />
        </div>
      </div>

      <div className="flex gap-8">
        {/* Left sidebar - desktop */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-hidden">
            <DocsSidebar sections={sidebarSections} activeSection={activeSection} />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <article className="prose prose-gray dark:prose-invert max-w-none prose-headings:scroll-mt-24">
            {children}
          </article>
        </main>

        {/* Right sidebar - table of contents */}
        <aside className="hidden xl:block w-52 flex-shrink-0">
          <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-hidden">
            <TableOfContents items={tocItems} title={tocTitle ?? t("sidebar.onThisPage")} />
          </div>
        </aside>
      </div>
    </div>
  );
}
