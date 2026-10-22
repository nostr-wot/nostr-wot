'use client';

import {ArticleSidebar} from '@/components/layout/ArticleSidebar';
import { useTranslations } from 'next-intl';
import { GitHubIcon, LinkedInIcon } from '@/components/icons';
import type { AuthorSocials } from '@/lib/blog';
import { type Locale } from '@/i18n/config';

interface SearchablePost {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
}

interface BlogSidebarProps {
  tags: string[];
  currentTags?: string[];
  currentQuery?: string;
  authorNpub?: string;
  authorSocials?: AuthorSocials;
  currentLocale?: Locale;
  translations?: Partial<Record<Locale, string>>; // Maps locale to slug
  allPosts?: SearchablePost[]; // For autocomplete search
}

export function BlogSidebar({authorSocials, ...props}: BlogSidebarProps) {
  return <><ArticleSidebar section="blog" {...props}/><BlogAuthorFollow authorSocials={authorSocials}/></>;
}

export function BlogAuthorFollow({ authorSocials }: { authorSocials?: AuthorSocials }) {
  const t = useTranslations('blog.sidebar');
  const hasSocials = authorSocials?.linkedin || authorSocials?.github;
  if (!hasSocials) return null;
  return <div className="mt-8">
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
  </div>;
}
