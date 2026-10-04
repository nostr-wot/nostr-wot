"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { useEffect, useState } from "react";

interface NavLink { href: string; label: string }
interface NavSection { title: string; links: NavLink[] }

export function DocsNav({ sections }: { sections: NavSection[] }) {
  const t = useTranslations("docs");
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeHref, setActiveHref] = useState(pathname);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const anchors = sections.flatMap(section => section.links)
        .filter(link => link.href.split('#')[0] === pathname && link.href.includes('#'))
        .map(link => ({ href: link.href, element: document.getElementById(link.href.split('#')[1]) }))
        .filter(item => item.element !== null)
        .sort((a, b) => a.element!.getBoundingClientRect().top - b.element!.getBoundingClientRect().top);
      const current = anchors.filter(item => item.element!.getBoundingClientRect().top <= Math.min(280, window.innerHeight * 0.35)).at(-1);
      setActiveHref(current?.href ?? pathname);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('hashchange', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('hashchange', schedule);
    };
  }, [pathname, sections]);

  const filtered = sections.map(section => ({ ...section, links: section.links.filter(link =>
    `${section.title} ${link.label}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
  ) })).filter(section => section.links.length > 0);

  const content = () => <>
    <input type="search" value={query} onChange={event => setQuery(event.target.value)}
      aria-label={t('navigationSearch')} placeholder={t('navigationSearch')}
      className="mb-6 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-900" />
    {filtered.length === 0 && <p role="status" className="text-sm text-gray-500">{t('navigationNoResults')}</p>}
    <nav className="space-y-6" aria-label={t('labels.documentationMenu')}>
      {filtered.map(section => <div key={section.title}>
        <p className="font-semibold text-sm text-gray-500 dark:text-gray-400 mb-2">{section.title}</p>
        <ul className="space-y-1 border-l border-gray-200 dark:border-gray-700">
          {section.links.map(link => <li key={link.href}>
            <Link href={link.href} aria-current={activeHref === link.href ? (link.href.includes('#') ? 'location' : 'page') : undefined}
              onClick={() => setIsMobileOpen(false)}
              className={`block py-1.5 pl-4 text-sm border-l-2 -ml-px transition-colors ${activeHref === link.href ? 'border-primary text-primary font-medium' : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'}`}>
              {link.label}
            </Link>
          </li>)}
        </ul>
      </div>)}
    </nav>
  </>;

  return <>
    <div className="lg:hidden fixed bottom-4 right-4 z-40">
      <button onClick={() => setIsMobileOpen(!isMobileOpen)} aria-expanded={isMobileOpen} aria-controls="docs-mobile-navigation"
        className="flex items-center justify-center w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90"
        aria-label={t('labels.toggleNavigation')}>
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
        </svg>
      </button>
    </div>
    {isMobileOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setIsMobileOpen(false)} />}
    <aside id="docs-mobile-navigation" inert={!isMobileOpen} onKeyDown={event => { if (event.key === 'Escape') setIsMobileOpen(false); }}
      className={`fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-gray-950 transition-transform duration-200 motion-reduce:transition-none lg:hidden overflow-y-auto ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-6 pt-20">{content()}</div>
    </aside>
    <aside className="hidden lg:block w-56 flex-shrink-0">
      <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-4 pb-8">{content()}</div>
    </aside>
  </>;
}
