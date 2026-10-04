import { getFullUrl } from './metadata';
import type { Locale } from '../i18n/config';
import { HELP_TOPICS, helpTopicHref, type HelpTopic } from './help-topics';
import { breadcrumbJsonLd, collectionPageJsonLd } from './jsonld';

export type HelpArticleCopy = { title: string; overview: string; before: string[]; steps: string[]; checks: string[] };

export function helpCollectionJsonLd(locale: Locale, title: string, description: string, topics: Record<string, HelpArticleCopy>) {
  const url = getFullUrl('/help', locale);
  return { ...collectionPageJsonLd({ name: title, description, url, items: HELP_TOPICS.map(topic => ({ name: topics[topic.id].title, url: getFullUrl(helpTopicHref(topic), locale) })) }), '@id': `${url}#webpage`, inLanguage: locale };
}

export function helpArticleJsonLd(locale: Locale, topic: HelpTopic, copy: HelpArticleCopy) {
  const url = getFullUrl(helpTopicHref(topic), locale);
  const helpUrl = getFullUrl('/help', locale);
  return {
    '@context': 'https://schema.org', '@type': 'TechArticle', '@id': `${url}#article`,
    headline: copy.title, description: copy.overview, url, inLanguage: locale,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    isPartOf: { '@type': 'CollectionPage', '@id': `${helpUrl}#webpage`, url: helpUrl },
    publisher: { '@type': 'Organization', name: 'Nostr WoT', url: getFullUrl('/', 'en') },
    articleBody: [copy.overview, ...copy.before, ...copy.steps, ...copy.checks].join('\n\n'),
    ...(topic.screenshots?.length ? { image: topic.screenshots.map(id => getFullUrl(`/images/guides/extension/${id}.png`, 'en')) } : {}),
  };
}

export function helpBreadcrumbJsonLd(locale: Locale, helpTitle: string, topic?: HelpTopic, title?: string) {
  return breadcrumbJsonLd([
    { name: 'Nostr WoT', url: getFullUrl('/', locale) },
    { name: helpTitle, url: getFullUrl('/help', locale) },
    ...(topic && title ? [{ name: title, url: getFullUrl(helpTopicHref(topic), locale) }] : []),
  ]);
}
