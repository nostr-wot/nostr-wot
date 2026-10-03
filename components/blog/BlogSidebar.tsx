'use client';

import { useState, useEffect, useRef } from 'react';
import { Link, useRouter } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { GitHubIcon, LinkedInIcon } from '@/components/icons';
import type { AuthorSocials } from '@/lib/blog';
import { type Locale, localeNames } from '@/i18n/config';

interface SearchablePost {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
}

interface BlogSidebarProps {
  tags: string[];
  relatedPosts?: {
    slug: string;
    title: string;
    date: string;
  }[];
  currentTag?: string;
  authorNpub?: string;
  authorSocials?: AuthorSocials;
  currentLocale?: Locale;
  translations?: Partial<Record<Locale, string>>; // Maps locale to slug
  allPosts?: SearchablePost[]; // For autocomplete search
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  );
}

export function BlogSidebar({
  tags,
  relatedPosts,
  currentTag,
  authorSocials,
  currentLocale,
  translations,
  allPosts = []
}: BlogSidebarProps) {
  const locale = useLocale();
  const t = useTranslations('blog.sidebar');
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchablePost[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasSocials = authorSocials?.linkedin || authorSocials?.github;
  const availableLocales = translations ? Object.keys(translations) as Locale[] : [];
  const showLanguageSwitcher = availableLocales.length > 1;

  // Filter posts based on search query
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = allPosts.filter((post) =>
      post.title.toLowerCase().includes(query) ||
      post.excerpt.toLowerCase().includes(query) ||
      post.tags.some(tag => tag.toLowerCase().includes(query))
    ).slice(0, 5); // Limit to 5 suggestions

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    setSelectedIndex(-1);
  }, [searchQuery, allPosts]);

  // Close suggestions when clicking outside
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
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          router.push(`/blog/${suggestions[selectedIndex].slug}`);
          setShowSuggestions(false);
          setSearchQuery('');
        } else if (searchQuery.trim()) {
          router.push(`/blog?q=${encodeURIComponent(searchQuery.trim())}`);
          setShowSuggestions(false);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (slug: string) => {
    router.push(`/blog/${slug}`);
    setShowSuggestions(false);
    setSearchQuery('');
  };

  const handleLanguageChange = (targetLocale: Locale, slug: string) => {
    router.push(`/blog/${slug}`, { locale: targetLocale });
  };

  return (
    <aside className="space-y-6">
      {/* Language Switcher - only on post pages with multiple languages */}
      {showLanguageSwitcher && translations && (
        <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <GlobeIcon className="w-4 h-4" />
            {t('language')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {availableLocales.map((loc) => {
              const slug = translations[loc];
              if (!slug) return null;
              return (
                <button
                  key={loc}
                  onClick={() => handleLanguageChange(loc, slug)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    currentLocale === loc
                      ? 'bg-primary text-white cursor-default'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary'
                  }`}
                  disabled={currentLocale === loc}
                >
                  {localeNames[loc]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
          {t('search')}
        </h3>
        <div ref={searchRef} className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon className="w-4 h-4" />
          </div>

          {/* Autocomplete Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
              {suggestions.map((post, index) => (
                <button
                  key={post.slug}
                  onClick={() => handleSuggestionClick(post.slug)}
                  className={`w-full px-4 py-3 text-left transition-colors ${
                    index === selectedIndex
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                    {post.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                    {post.excerpt}
                  </p>
                </button>
              ))}
              {searchQuery.trim().length >= 2 && (
                <Link
                  href={`/blog?q=${encodeURIComponent(searchQuery.trim())}`}
                  onClick={() => setShowSuggestions(false)}
                  className="block w-full px-4 py-2.5 text-center text-sm text-primary hover:bg-primary/5 border-t border-gray-200 dark:border-gray-700 transition-colors"
                >
                  {t('viewAllResults')}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
            {t('tags')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                  currentTag === tag
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary'
                }`}
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Related Posts - only on post pages */}
      {relatedPosts && relatedPosts.length > 0 && (
        <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
            {t('relatedPosts')}
          </h3>
          <div className="space-y-4">
            {relatedPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block group"
              >
                <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h4>
                <time className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                  {new Date(post.date).toLocaleDateString(locale, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </time>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Follow Author - only when author info is provided (on post pages) */}
      {hasSocials && (
        <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 dark:from-primary/10 dark:to-purple-500/10 rounded-xl border border-primary/20 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
            {t('followUs')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {t('followDescription')}
          </p>
          <div className="flex items-center gap-3">
            {authorSocials?.linkedin && (
              <a
                href={`https://linkedin.com/in/${authorSocials.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-white dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 hover:text-[#0077B5] hover:bg-[#0077B5]/10 transition-colors"
                aria-label="LinkedIn"
              >
                <LinkedInIcon className="w-5 h-5" />
              </a>
            )}
            {authorSocials?.github && (
              <a
                href={`https://github.com/${authorSocials.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-white dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="GitHub"
              >
                <GitHubIcon className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
