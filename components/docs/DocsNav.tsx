"use client";

import { Link, usePathname } from "@/i18n/routing";
import { useState } from "react";

interface NavLink {
  href: string;
  label: string;
}

interface NavSection {
  title: string;
  links: NavLink[];
}

interface DocsNavProps {
  sections: NavSection[];
}

export function DocsNav({ sections }: DocsNavProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Check if a link is active (matches current path, ignoring hash)
  const isActive = (href: string) => {
    const hrefPath = href.split("#")[0];
    // Remove locale prefix for comparison
    const currentPath = pathname.replace(/^\/(en|es|pt)/, "");
    return currentPath === hrefPath || currentPath === hrefPath + "/";
  };

  // Check if a link is the current anchor
  const isCurrentAnchor = (href: string) => {
    if (typeof window === "undefined") return false;
    const hash = window.location.hash;
    return href.includes("#") && href.endsWith(hash);
  };

  const NavContent = () => (
    <nav className="space-y-6">
      {sections.map((section, idx) => (
        <div key={idx}>
          <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
            {section.title}
          </h3>
          <ul className="space-y-1 border-l border-gray-200 dark:border-gray-700">
            {section.links.map((link) => {
              const active = isActive(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`block py-1.5 pl-4 text-sm border-l-2 -ml-px transition-colors ${
                      active
                        ? "border-primary text-primary font-medium"
                        : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="flex items-center justify-center w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-colors"
          aria-label="Toggle navigation"
        >
          {isMobileOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-gray-950 transform transition-transform duration-300 lg:hidden overflow-y-auto ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 pt-20">
          <NavContent />
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-56 flex-shrink-0">
        <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-4 pb-8">
          <NavContent />
        </div>
      </aside>
    </>
  );
}
