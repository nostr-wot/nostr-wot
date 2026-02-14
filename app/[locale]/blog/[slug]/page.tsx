import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { getBlogPost, getBlogSlugs, getRelatedPosts, getAllTags, getAllBlogPosts, formatDate } from '@/lib/blog';
import { generateBlogAlternates } from '@/lib/metadata';
import { type Locale, locales } from '@/i18n/config';
import { BlogContent, BlogCard, BlogSidebar } from '@/components/blog';
import { ScrollReveal, Section, LinkButton } from '@/components/ui';
import { ArrowLeftIcon } from '@/components/icons';
import {NewsletterSection} from "@/components/layout/NewsletterSection";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];

  for (const locale of locales) {
    const slugs = getBlogSlugs(locale);
    for (const slug of slugs) {
      params.push({ locale, slug });
    }
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getBlogPost(slug, locale as Locale);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const ogImage = post.ogImage || post.featuredImage;

  return {
    title,
    description,
    alternates: generateBlogAlternates('/blog', post.translations, locale as Locale),
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author.name],
      tags: post.tags,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations('blog');
  const post = getBlogPost(slug, locale as Locale);

  if (!post || !post.published) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(slug, 3, locale as Locale);
  const allTags = getAllTags(locale as Locale);
  const allPosts = getAllBlogPosts(locale as Locale);

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': post.title,
    'description': post.excerpt,
    'image': post.featuredImage,
    'datePublished': post.date,
    'dateModified': post.date,
    'author': {
      '@type': 'Person',
      'name': post.author.name,
      'url': post.author.npub ? `https://njump.me/${post.author.npub}` : undefined,
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
      '@id': `https://nostr-wot.com/blog/${slug}`,
    },
    'keywords': post.tags.join(', '),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="py-4 mb-14">
        <article>
          {/* Hero */}
          <header className="relative pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-6">
              <ScrollReveal animation="fade-up">
                <LinkButton
                  href="/blog"
                  variant="secondary"
                  className="mb-8 inline-flex items-center gap-2 !px-4 !py-2 text-sm"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  {t('backToBlog')}
                </LinkButton>
              </ScrollReveal>

              <ScrollReveal animation="fade-up" delay={100}>
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

              <ScrollReveal animation="fade-up" delay={150}>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                  {post.title}
                </h1>
              </ScrollReveal>

              <ScrollReveal animation="fade-up" delay={200}>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                  {post.excerpt}
                </p>
              </ScrollReveal>

              <ScrollReveal animation="fade-up" delay={250}>
                <div className="flex items-center gap-4 pb-8 border-b border-gray-200 dark:border-gray-700">
                  {post.author.avatar && (
                    <Image
                      src={post.author.avatar}
                      alt={post.author.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {post.author.name}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                      <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
                      <span>·</span>
                      <span>{post.readingTime}</span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </header>

          {/* Featured Image */}
          <ScrollReveal animation="fade-up" delay={300}>
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
            <div className="lg:flex lg:gap-12">
              {/* Main Content - max-w-prose for optimal readability (65ch ~700px) */}
              <article className="flex-1 min-w-0 max-w-prose">
                <ScrollReveal animation="fade-up" delay={350}>
                  <BlogContent content={post.content} />
                </ScrollReveal>

                {/* Author Box */}
                <ScrollReveal animation="fade-up" delay={400}>
                  <div className="mt-12 flex items-start gap-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700/50">
                    {post.author.avatar && (
                      <Image
                        src={post.author.avatar}
                        alt={post.author.name}
                        width={64}
                        height={64}
                        className="rounded-full flex-shrink-0"
                      />
                    )}
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        {t('writtenBy')}
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {post.author.name}
                      </p>
                      {post.author.npub && (
                        <a
                          href={`https://njump.me/${post.author.npub}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline mt-1 inline-block"
                        >
                          {t('viewOnNostr')}
                        </a>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              </article>

              {/* Sidebar */}
              <aside className="hidden lg:block w-80 flex-shrink-0">
                <div className="sticky top-24">
                  <BlogSidebar
                    tags={allTags}
                    relatedPosts={relatedPosts.map((p) => ({
                      slug: p.slug,
                      title: p.title,
                      date: p.date,
                    }))}
                    authorNpub={post.author.npub}
                    authorSocials={post.author.socials}
                    currentLocale={locale as Locale}
                    translations={post.translations}
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

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <Section padding="lg">
            <ScrollReveal animation="fade-up">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                {t('relatedPosts')}
              </h2>
            </ScrollReveal>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost, index) => (
                <ScrollReveal key={relatedPost.slug} animation="fade-up" delay={100 + index * 50}>
                  <BlogCard post={relatedPost} />
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
    </>
  );
}
