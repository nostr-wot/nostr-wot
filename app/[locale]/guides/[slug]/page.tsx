import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { getGuide, getGuideSlugs, getRelatedGuides, getAllGuideTags, getAllGuides } from '@/lib/guides';
import { generateBlogAlternates, getFullUrl } from '@/lib/metadata';
import { type Locale, locales } from '@/i18n/config';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://nostr-wot.com';

const ogLocaleMap: Record<Locale, string> = {
  en: 'en_US',
  es: 'es_ES',
  pt: 'pt_BR',
  ru: 'ru_RU',
  it: 'it_IT',
  fr: 'fr_FR',
  de: 'de_DE',
};

import { BlogContent } from '@/components/blog';
import { GuideSidebar, GuidePostWrapper } from '@/components/guides';
import { GuideCard } from '@/components/guides';
import { ScrollReveal, Section, LinkButton } from '@/components/ui';
import { ArrowLeftIcon } from '@/components/icons';
import { NewsletterSection } from '@/components/layout/NewsletterSection';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];

  for (const locale of locales) {
    const slugs = getGuideSlugs(locale);
    for (const slug of slugs) {
      params.push({ locale, slug });
    }
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const guide = getGuide(slug, locale as Locale);

  if (!guide) {
    return {
      title: 'Guide Not Found',
    };
  }

  const title = guide.seoTitle || guide.title;
  const description = guide.seoDescription || guide.excerpt;
  const ogImage = guide.ogImage || guide.featuredImage;
  const ogImageUrl = ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`;

  return {
    title,
    description,
    keywords: guide.tags,
    alternates: generateBlogAlternates('/guides', guide.translations, locale as Locale),
    openGraph: {
      title,
      description,
      url: getFullUrl(`/guides/${slug}`, locale as Locale),
      siteName: 'Nostr WoT',
      locale: ogLocaleMap[locale as Locale],
      type: 'article',
      publishedTime: guide.date,
      authors: [guide.author.name],
      tags: guide.tags,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: guide.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function GuidePostPage({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations('guides');
  const guide = getGuide(slug, locale as Locale);

  if (!guide || !guide.published) {
    notFound();
  }

  const relatedGuides = getRelatedGuides(slug, 3, locale as Locale);
  const allTags = getAllGuideTags(locale as Locale);
  const allGuides = getAllGuides(locale as Locale);

  const difficultyLabels: Record<string, string> = {
    beginner: t('difficulty.beginner'),
    intermediate: t('difficulty.intermediate'),
    advanced: t('difficulty.advanced'),
  };

  // JSON-LD structured data (HowTo schema)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    'name': guide.title,
    'description': guide.excerpt,
    'image': guide.featuredImage.startsWith('http') ? guide.featuredImage : `${BASE_URL}${guide.featuredImage}`,
    'datePublished': guide.date,
    'dateModified': guide.date,
    'author': {
      '@type': 'Person',
      'name': guide.author.name,
      'url': guide.author.npub ? `https://njump.me/${guide.author.npub}` : undefined,
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Nostr Web of Trust',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://nostr-wot.com/icon-512.png',
      },
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': getFullUrl(`/guides/${slug}`, locale as Locale),
    },
    'keywords': guide.tags.join(', '),
  };

  const formatDate = (dateString: string, loc: string = 'en') => {
    const date = new Date(dateString);
    return date.toLocaleDateString(loc, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });
  };

  return (
    <GuidePostWrapper translations={guide.translations}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="py-4 mb-14">
        <article>
          {/* Hero */}
          <header className="relative pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-6">
              <ScrollReveal animation="fade-up" immediate>
                <LinkButton
                  href="/guides"
                  variant="secondary"
                  className="mb-8 inline-flex items-center gap-2 !px-4 !py-2 text-sm"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  {t('backToGuides')}
                </LinkButton>
              </ScrollReveal>

              <ScrollReveal animation="fade-up" delay={100} immediate>
                <div className="flex flex-wrap gap-2 mb-6">
                  {guide.difficulty && (
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      guide.difficulty === 'beginner'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : guide.difficulty === 'intermediate'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}>
                      {difficultyLabels[guide.difficulty] || guide.difficulty}
                    </span>
                  )}
                  {guide.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </ScrollReveal>

              <ScrollReveal animation="fade-up" delay={150} immediate>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                  {guide.title}
                </h1>
              </ScrollReveal>

              <ScrollReveal animation="fade-up" delay={200} immediate>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                  {guide.excerpt}
                </p>
              </ScrollReveal>

              <ScrollReveal animation="fade-up" delay={250} immediate>
                <div className="flex items-center gap-4 pb-8 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <time dateTime={guide.date}>{formatDate(guide.date, locale)}</time>
                    <span>·</span>
                    <span>{guide.readingTime}</span>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </header>

          {/* Featured Image */}
          <ScrollReveal animation="fade-up" delay={300} immediate>
            <div className="max-w-5xl mx-auto px-6 mb-12">
              <div className="relative aspect-[2/1] rounded-2xl overflow-hidden">
                <Image
                  src={guide.featuredImage}
                  alt={guide.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1200px) 100vw, 1200px"
                />
              </div>
            </div>
          </ScrollReveal>

          {/* Content + Sidebar */}
          <div className="flex justify-center max-w-7xl mx-auto px-6 pb-16">
            <div className="lg:flex lg:gap-12">
              {/* Main Content */}
              <article className="flex-1 min-w-0 max-w-prose">
                <BlogContent content={guide.content} />
              </article>

              {/* Sidebar */}
              <aside className="hidden lg:block w-72 flex-shrink-0">
                <div className="sticky top-24">
                  <GuideSidebar
                    tags={allTags}
                    relatedGuides={relatedGuides.map((g) => ({
                      slug: g.slug,
                      title: g.title,
                      date: g.date,
                    }))}
                    currentLocale={locale as Locale}
                    translations={guide.translations}
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
          </div>
        </article>

        {/* Related Guides */}
        {relatedGuides.length > 0 && (
          <Section padding="lg">
            <ScrollReveal animation="fade-up">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                {t('relatedGuides')}
              </h2>
            </ScrollReveal>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedGuides.map((relatedGuide, index) => (
                <ScrollReveal key={relatedGuide.slug} animation="fade-up" delay={100 + index * 50}>
                  <GuideCard guide={relatedGuide} />
                </ScrollReveal>
              ))}
            </div>
          </Section>
        )}

        {/* Newsletter */}
        <ScrollReveal animation="fade-left" delay={200}>
          <NewsletterSection />
        </ScrollReveal>
      </main>
    </GuidePostWrapper>
  );
}
