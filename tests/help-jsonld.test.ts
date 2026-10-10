import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { locales } from '../i18n/config';
import { HELP_TOPICS, helpTopicHref } from '../lib/help-topics';
import { helpArticleJsonLd, helpBreadcrumbJsonLd, helpCollectionJsonLd } from '../lib/help-jsonld';
import { getFullUrl } from '../lib/metadata';
import { serializeJsonLd } from '../lib/serialize-jsonld';

test('help schemas match localized visible content and canonical routes', () => {
  for (const locale of locales) {
    const copy = JSON.parse(fs.readFileSync(`messages/${locale}/help.json`, 'utf8'));
    const collection = helpCollectionJsonLd(locale, copy.search, copy.description, copy.topics);
    assert.equal(collection.inLanguage, locale);
    assert.equal(collection.mainEntity?.itemListElement.length, 22);
    for (const topic of HELP_TOPICS) {
      const content = copy.topics[topic.id];
      const graph = helpArticleJsonLd(locale, topic, content);
      assert.equal(graph.url, getFullUrl(helpTopicHref(topic), locale));
      assert.equal(graph.headline, content.title);
      assert.equal(graph.description, content.overview);
      for (const paragraph of [...content.before, ...content.steps, ...content.checks]) assert.ok(graph.articleBody.includes(paragraph));
      assert.equal(graph.isPartOf['@id'], collection['@id']);
      assert.ok(!('datePublished' in graph));
      const crumbs = helpBreadcrumbJsonLd(locale, copy.title, topic, content.title);
      assert.equal(crumbs.itemListElement.at(-1)?.item, graph.url);
      assert.deepEqual(crumbs.itemListElement.map(item => item.position), [1, 2, 3]);
      assert.equal(new URL(graph.url).search, '');
      assert.equal(new URL(graph.url).hash, '');
    }
  }
});

test('help JSON-LD safely escapes content and does not invent rich-result claims', () => {
  const graph = helpArticleJsonLd('en', HELP_TOPICS[0], { title: '</script>', overview: 'A real description', before: ['Before'], steps: ['Step'], checks: ['Check'] });
  assert.ok(!serializeJsonLd(graph).includes('</script>'));
  assert.equal(graph['@type'], 'TechArticle');
  assert.ok(!('aggregateRating' in graph));
});
