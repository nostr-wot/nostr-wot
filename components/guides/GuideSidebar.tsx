'use client';

import { useState, useRef, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { type Locale, localeNames } from '@/i18n/config';

interface GuideSidebarProps {
  tags?: string[];
  currentTag?: string;
  relatedGuides?: { slug: string; title: string; date: string }[];
  currentLocale: Locale;
  translations?: Partial<Record<Locale, string>>;
  allGuides?: { slug: string; title: string; excerpt: string; tags: string[] }[];
}

export function GuideSidebar({
  tags,
  currentTag,
  relatedGuides,
  currentLocale,
  translations,
  allGuides,
}: GuideSidebarProps) {
  const t = useTranslations('guides.sidebar');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);

  const suggestions = searchQuery.length >= 2 && allGuides
    ? allGuides
        .filter(
          (guide) =>
            guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            guide.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
            guide.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .slice(0, 5)
    : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Language Switcher */}
      {translations && Object.keys(translations).length > 1 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            {t('language')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(translations) as [Locale, string][]).map(([locale, slug]) => (
              <Link
                key={locale}
                href={`/guides/${slug}`}
                locale={locale}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  locale === currentLocale
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {localeNames[locale]}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div ref={searchRef}>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          {t('search')}
        </h3>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={t('searchPlaceholder')}
            className="w-full px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white placeholder-gray-500"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-10">
              {suggestions.map((guide, index) => (
                <Link
                  key={guide.slug}
                  href={`/guides/${guide.slug}`}
                  className={`block px-4 py-2 text-sm transition-colors ${
                    index === selectedIndex
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setShowSuggestions(false)}
                >
                  {guide.title}
                </Link>
              ))}
              <Link
                href={`/guides?q=${encodeURIComponent(searchQuery)}`}
                className="block px-4 py-2 text-sm text-primary border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => setShowSuggestions(false)}
              >
                {t('viewAllResults')}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            {t('tags')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/guides?tag=${encodeURIComponent(tag)}`}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  currentTag?.toLowerCase() === tag.toLowerCase()
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Related Guides */}
      {relatedGuides && relatedGuides.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            {t('relatedGuides')}
          </h3>
          <div className="space-y-3">
            {relatedGuides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                className="block text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
              >
                {guide.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All Guides link */}
      <div>
        <Link
          href="/guides"
          className="text-sm text-primary hover:underline"
        >
          {t('allGuides')}
        </Link>
      </div>
    </div>
  );
}
