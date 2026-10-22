'use client';

import {ArticleSidebar} from '@/components/layout/ArticleSidebar';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { type Locale } from '@/i18n/config';

interface GuideSidebarProps {
  tags?: string[];
  currentTags?: string[];
  currentQuery?: string;
  relatedGuides?: { slug: string; title: string; date: string }[];
  currentLocale: Locale;
  translations?: Partial<Record<Locale, string>>;
  allGuides?: { slug: string; title: string; excerpt: string; tags: string[] }[];
}

export function GuideSidebar({
  tags,
  currentTags,
  currentQuery,
  relatedGuides,
  currentLocale,
  translations,
  allGuides,
}: GuideSidebarProps) {
  const t = useTranslations('guides.sidebar');
  return (
    <div className="space-y-5">
      <ArticleSidebar section="guides" tags={tags || []} currentTags={currentTags} currentQuery={currentQuery} currentLocale={currentLocale} translations={translations} allPosts={allGuides}/>
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
