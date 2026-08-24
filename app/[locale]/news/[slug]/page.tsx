import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { getNewsPost, getNewsSlugs, getRelatedNews, getAllNews, getAllNewsTags } from '@/lib/news';
import { formatDate } from '@/lib/blog';
import { generateBlogAlternates, getFullUrl } from '@/lib/metadata';
import { type Locale, locales } from '@/i18n/config';
import {
  JsonLd,
  breadcrumbJsonLd,
  itemListJsonLd,
  newsArticleJsonLd,
} from '@/lib/jsonld';
import { BlogContent, BlogPostWrapper } from '@/components/blog';
import { NewsCard, NewsMeta, NewsSidebar } from '@/components/news';
import { ScrollReveal, Section, LinkButton } from '@/components/ui';
import { ArrowLeftIcon, ExternalLinkIcon } from '@/components/icons';
import { NewsletterSection } from '@/components/layout/NewsletterSection';

// Locale to OpenGraph locale format mapping
const ogLocaleMap: Record<Locale, string> = {
  en: 'en_US',
  es: 'es_ES',
  pt: 'pt_BR',
  ru: 'ru_RU',
  it: 'it_IT',
  fr: 'fr_FR',
  de: 'de_DE',
};

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];

  for (const locale of locales) {
    const slugs = getNewsSlugs(locale);
    for (const slug of slugs) {
      params.push({ locale, slug });
    }
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getNewsPost(slug, locale as Locale);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;

  return {
    title,
    description,
    keywords: post.tags,
    alternates: generateBlogAlternates('/news', post.translations, locale as Locale),
    openGraph: {
      title,
      description,
      url: getFullUrl(`/news/${slug}`, locale as Locale),
      siteName: 'Nostr WoT',
      locale: ogLocaleMap[locale as Locale],
      type: 'article',
      // The real ship date, never the event date.
      publishedTime: post.publishedAt,
      ...(post.updated ? { modifiedTime: post.updated } : {}),
      authors: [post.author.name],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function NewsPostPage({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations('news');
  const post = getNewsPost(slug, locale as Locale);

  if (!post || !post.published) {
    notFound();
  }

  const relatedNews = getRelatedNews(slug, 3, locale as Locale);
  const allTags = getAllNewsTags(locale as Locale);
  const allPosts = getAllNews(locale as Locale);
  const url = getFullUrl(`/news/${slug}`, locale as Locale);

  const articleLd = newsArticleJsonLd({
    headline: post.title,
    description: post.excerpt,
    image: post.featuredImage,
    url,
    // post.date is the EVENT date and has no place in this graph; only
    // post.publishedAt, the real ship date, may become `datePublished`.
    publishedAt: post.publishedAt,
    updated: post.updated,
    tags: post.tags,
    sources: post.sources,
  });

  const crumbsLd = breadcrumbJsonLd([
    { name: 'Home', url: getFullUrl('/', locale as Locale) },
    { name: t('title'), url: getFullUrl('/news', locale as Locale) },
    { name: post.title, url },
  ]);

  const graphs =
    post.type === 'digest' && post.items.length > 0
      ? [articleLd, crumbsLd, itemListJsonLd(post.items)]
      : [articleLd, crumbsLd];

  return (
    <BlogPostWrapper translations={post.translations}>
      <JsonLd data={graphs} />
      <main className="py-4 mb-14">
        <article>
          {/* Hero */}
          <header className="relative pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-6">
              <ScrollReveal animation="fade-up" immediate>
                <LinkButton
                  href="/news"
                  variant="secondary"
                  className="mb-8 inline-flex items-center gap-2 !px-4 !py-2 text-sm"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  {t('backToNews')}
                </LinkButton>
              </ScrollReveal>

              {post.tags.length > 0 && (
                <ScrollReveal animation="fade-up" delay={100} immediate>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </ScrollReveal>
              )}

              <ScrollReveal animation="fade-up" delay={150} immediate>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                  {post.title}
                </h1>
              </ScrollReveal>

              <ScrollReveal animation="fade-up" delay={200} immediate>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">{post.excerpt}</p>
              </ScrollReveal>

              <ScrollReveal animation="fade-up" delay={250} immediate>
                <div className="pb-8 border-b border-gray-200 dark:border-gray-700">
                  <p className="font-medium text-gray-900 dark:text-white mb-3">
                    {post.author.name}
                  </p>
                  <NewsMeta
                    post={post}
                    typeLabel={t(`types.${post.type}`)}
                    formattedDate={formatDate(post.date, locale)}
                    disclosure={t('disclosure')}
                  />
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                    <time dateTime={post.publishedAt}>
                      {t('publishedOn', { date: formatDate(post.publishedAt, locale) })}
                    </time>
                    {post.updated && (
                      <>
                        <span className="mx-2" aria-hidden="true">
                          ·
                        </span>
                        <time dateTime={post.updated}>
                          {t('updatedOn', { date: formatDate(post.updated, locale) })}
                        </time>
                      </>
                    )}
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </header>

          {/* Featured Image */}
          <ScrollReveal animation="fade-up" delay={300} immediate>
            <div className="max-w-5xl mx-auto px-6 mb-12">
              <div className="relative aspect-[2/1] rounded-2xl overflow-hidden">
                <Image
                  src={post.featuredImage}
                  alt={post.title}
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
            <div className="min-w-0 lg:flex lg:gap-12">
              <article className="flex-1 min-w-0 max-w-prose">
                <BlogContent content={post.content} />

              {/* Digest items */}
              {post.type === 'digest' && post.items.length > 0 && (
                <ScrollReveal animation="fade-up">
                  <section className="mt-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                      {t('digestItems')}
                    </h2>
                    <ol className="space-y-4">
                      {post.items.map((item, index) => (
                        <li
                          key={`${item.url}-${index}`}
                          className="rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800/50 p-5"
                        >
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-start gap-2 font-semibold text-gray-900 dark:text-white hover:text-primary transition-colors"
                          >
                            <span>{item.title}</span>
                            <ExternalLinkIcon className="w-4 h-4 mt-1 flex-shrink-0 opacity-60" />
                          </a>
                          {item.summary && (
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                              {item.summary}
                            </p>
                          )}
                        </li>
                      ))}
                    </ol>
                  </section>
                </ScrollReveal>
              )}

              {/* Sources */}
              {post.sources.length > 0 && (
                <ScrollReveal animation="fade-up">
                  <section className="mt-12 rounded-xl border border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/50 p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {t('sources.heading')}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {t('sources.intro')}
                    </p>
                    <ol className="space-y-3 list-decimal list-outside pl-5 marker:text-gray-400 dark:marker:text-gray-500">
                      {post.sources.map((source, index) => (
                        <li key={`${source.url}-${index}`} className="text-sm">
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline break-words"
                          >
                            {source.title}
                          </a>
                          {(source.publisher || source.date) && (
                            <span className="text-gray-500 dark:text-gray-400">
                              {source.publisher ? ` — ${source.publisher}` : ''}
                              {source.date ? ` (${formatDate(source.date, locale)})` : ''}
                            </span>
                          )}
                        </li>
                      ))}
                    </ol>
                  </section>
                </ScrollReveal>
              )}
              </article>

              {/* Sidebar */}
              <aside className="hidden lg:block w-80 flex-shrink-0">
                <div className="sticky top-24">
                  <NewsSidebar
                    tags={allTags}
                    relatedPosts={relatedNews.map((p) => ({
                      slug: p.slug,
                      title: p.title,
                      date: p.date,
                    }))}
                    allPosts={allPosts.map((p) => ({
                      slug: p.slug,
                      title: p.title,
                      excerpt: p.excerpt,
                      tags: p.tags,
                    }))}
                  />
                </div>
              </aside>
            </div>
          </div>
        </article>

        {/* Related */}
        {relatedNews.length > 0 && (
          <Section padding="lg">
            <ScrollReveal animation="fade-up">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                {t('relatedNews')}
              </h2>
            </ScrollReveal>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedNews.map((relatedPost, index) => (
                <ScrollReveal key={relatedPost.slug} animation="fade-up" delay={100 + index * 50}>
                  <NewsCard post={relatedPost} />
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
    </BlogPostWrapper>
  );
}
