'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ScrollReveal, LinkButton } from '@/components/ui';
import { ArrowLeftIcon } from '@/components/icons';

export default function NotFound() {
  const t = useTranslations('notFound');

  return (
    <main className="min-h-[calc(100vh-200px)] flex items-center justify-center px-6">
      <div className="text-center max-w-2xl mx-auto">
        <ScrollReveal animation="fade-up">
          {/* 404 Number */}
          <div className="relative mb-8">
            <span className="text-[150px] md:text-[200px] font-bold text-gray-100 dark:text-gray-800 select-none leading-none">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                <svg
                  className="w-12 h-12 md:w-16 md:h-16 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delay={100}>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('title')}
          </h1>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delay={150}>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            {t('description')}
          </p>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delay={200}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <LinkButton href="/" variant="primary" className="gap-2">
              <ArrowLeftIcon className="w-4 h-4" />
              {t('backHome')}
            </LinkButton>
            <LinkButton href="/blog" variant="secondary">
              {t('visitBlog')}
            </LinkButton>
          </div>
        </ScrollReveal>

        {/* Decorative elements */}
        <ScrollReveal animation="fade-up" delay={300}>
          <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-500">
              {t('helpText')}{' '}
              <Link href="/contact" className="text-primary hover:underline">
                {t('contactUs')}
              </Link>
            </p>
          </div>
        </ScrollReveal>
      </div>
    </main>
  );
}
