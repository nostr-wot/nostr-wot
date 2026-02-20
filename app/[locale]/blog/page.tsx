import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getAllBlogPosts, getAllTags } from '@/lib/blog';
import { generateAlternates, generateOpenGraph, generateTwitter, getFullUrl } from '@/lib/metadata';
import { type Locale } from '@/i18n/config';
import { BlogCard, BlogSidebar } from '@/components/blog';
import { ScrollReveal, Section, SectionHeader } from '@/components/ui';
import {NewsletterSection} from "@/components/layout/NewsletterSection";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; tag?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations('blog.meta');
  const title = t('title');
  const description = t('description');

  return {
    title,
    description,
    alternates: generateAlternates('/blog', locale as Locale),
    openGraph: generateOpenGraph({
      title,
      description,
      path: '/blog',
      locale: locale as Locale,
    }),
    twitter: generateTwitter({ title, description }),
  };
}

export default async function BlogPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { q: searchQuery, tag: tagFilter } = await searchParams;
  const t = await getTranslations('blog');
  const allPosts = getAllBlogPosts(locale as Locale);
  const allTags = getAllTags(locale as Locale);

  // Filter posts by search query and/or tag
  const posts = allPosts.filter((post) => {
    const matchesSearch = !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag = !tagFilter ||
      post.tags.some(tag => tag.toLowerCase() === tagFilter.toLowerCase());

    return matchesSearch && matchesTag;
  });

  const isFiltered = !!(searchQuery || tagFilter);
  const featuredPost = isFiltered ? null : posts[0];
  const otherPosts = isFiltered ? posts : posts.slice(1);

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    'name': 'Nostr Web of Trust Blog',
    'description': 'News, updates, and insights about Web of Trust on Nostr',
    'url': getFullUrl('/blog', locale as Locale),
    'publisher': {
      '@type': 'Organization',
      'name': 'Nostr Web of Trust',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://nostr-wot.com/icon-512.png',
      },
    },
    'blogPost': posts.map((post) => ({
      '@type': 'BlogPosting',
      'headline': post.title,
      'description': post.excerpt,
      'datePublished': post.date,
      'author': {
        '@type': 'Person',
        'name': post.author.name,
      },
      'url': getFullUrl(`/blog/${post.slug}`, locale as Locale),
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
            {/* Posts */}
            <div className="flex-1 min-w-0">
              {/* Featured Post */}
              {featuredPost && (
                <section className="mb-12">
                  <ScrollReveal animation="fade-up" delay={100}>
                    <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-6">
                      {t('featured')}
                    </h2>
                    <BlogCard post={featuredPost} featured />
                  </ScrollReveal>
                </section>
              )}

              {/* Search/Filter Results or Other Posts */}
              {otherPosts.length > 0 && (
                <section>
                  <ScrollReveal animation="fade-up">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {isFiltered ? t('searchResults', { count: posts.length }) : t('latestPosts')}
                      </h2>
                      {isFiltered && (
                        <Link
                          href="/blog"
                          className="text-sm text-primary hover:underline"
                        >
                          {t('clearFilters')}
                        </Link>
                      )}
                    </div>
                  </ScrollReveal>
                  <div className="grid md:grid-cols-2 gap-8">
                    {otherPosts.map((post, index) => (
                      <ScrollReveal key={post.slug} animation="fade-up" delay={100 + index * 50}>
                        <BlogCard post={post} />
                      </ScrollReveal>
                    ))}
                  </div>
                </section>
              )}

              {/* Empty State */}
              {posts.length === 0 && (
                <div className="text-center py-20">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    {isFiltered ? t('noResults.title') : t('emptyState.title')}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {isFiltered ? t('noResults.description') : t('emptyState.description')}
                  </p>
                  {isFiltered && (
                    <Link
                      href="/blog"
                      className="text-primary hover:underline"
                    >
                      {t('clearFilters')}
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-24">
                <BlogSidebar
                  tags={allTags}
                  currentTag={tagFilter}
                  currentLocale={locale as Locale}
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

          {/* Newsletter */}
          <ScrollReveal animation="fade-left" delay={200}>
            <NewsletterSection />
          </ScrollReveal>
        </div>
      </main>
    </>
  );
}
