import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getAllGuides, getAllGuideTags } from '@/lib/guides';
import { generateAlternates, generateOpenGraph, generateTwitter, getFullUrl } from '@/lib/metadata';
import { type Locale } from '@/i18n/config';
import { GuideCard, GuideSidebar } from '@/components/guides';
import { ScrollReveal, Section } from '@/components/ui';
import { NewsletterSection } from '@/components/layout/NewsletterSection';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; tag?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations('guides.meta');
  const title = t('title');
  const description = t('description');

  return {
    title,
    description,
    alternates: generateAlternates('/guides', locale as Locale),
    openGraph: generateOpenGraph({
      title,
      description,
      path: '/guides',
      locale: locale as Locale,
    }),
    twitter: generateTwitter({ title, description }),
  };
}

export default async function GuidesPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { q: searchQuery, tag: tagFilter } = await searchParams;
  const t = await getTranslations('guides');
  const allGuides = getAllGuides(locale as Locale);
  const allTags = getAllGuideTags(locale as Locale);

  // Filter guides by search query and/or tag
  const guides = allGuides.filter((guide) => {
    const matchesSearch = !searchQuery ||
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag = !tagFilter ||
      guide.tags.some(tag => tag.toLowerCase() === tagFilter.toLowerCase());

    return matchesSearch && matchesTag;
  });

  const isFiltered = !!(searchQuery || tagFilter);

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': 'Nostr WoT Extension Guides',
    'description': 'Step-by-step guides to get the most out of the Nostr WoT Extension',
    'url': getFullUrl('/guides', locale as Locale),
    'publisher': {
      '@type': 'Organization',
      'name': 'Nostr Web of Trust',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://nostr-wot.com/icon-512.png',
      },
    },
    'hasPart': guides.map((guide) => ({
      '@type': 'HowTo',
      'name': guide.title,
      'description': guide.excerpt,
      'url': getFullUrl(`/guides/${guide.slug}`, locale as Locale),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        {/* Hero Section */}
        <Section padding="lg" className="pt-24">
          <ScrollReveal animation="fade-up">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('title')}</h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">{t('subtitle')}</p>
            </div>
          </ScrollReveal>
        </Section>

        {/* Main Content with Sidebar */}
        <div className="max-w-7xl mx-auto px-6 pb-16">
          <div className="lg:flex lg:flex-row lg:gap-8">
            {/* Guides Grid */}
            <div className="flex-1 min-w-0">
              {guides.length > 0 && (
                <section>
                  <ScrollReveal animation="fade-up">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {isFiltered ? t('searchResults', { count: guides.length }) : t('allGuides')}
                      </h2>
                      {isFiltered && (
                        <Link
                          href="/guides"
                          className="text-sm text-primary hover:underline"
                        >
                          {t('clearFilters')}
                        </Link>
                      )}
                    </div>
                  </ScrollReveal>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {guides.map((guide, index) => (
                      <ScrollReveal key={guide.slug} animation="fade-up" delay={100 + index * 50}>
                        <GuideCard guide={guide} />
                      </ScrollReveal>
                    ))}
                  </div>
                </section>
              )}

              {/* Empty State */}
              {guides.length === 0 && (
                <div className="text-center py-20">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    {isFiltered ? t('noResults.title') : t('emptyState.title')}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {isFiltered ? t('noResults.description') : t('emptyState.description')}
                  </p>
                  {isFiltered && (
                    <Link
                      href="/guides"
                      className="text-primary hover:underline"
                    >
                      {t('clearFilters')}
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-24">
                <GuideSidebar
                  tags={allTags}
                  currentTag={tagFilter}
                  currentLocale={locale as Locale}
                  allGuides={allGuides.map((g) => ({
                    slug: g.slug,
                    title: g.title,
                    excerpt: g.excerpt,
                    tags: g.tags,
                  }))}
                />
              </div>
            </aside>
          </div>

          {/* Newsletter */}
          <ScrollReveal animation="fade-left" delay={200}>
            <NewsletterSection />
          </ScrollReveal>
        </div>
      </main>
    </>
  );
}
