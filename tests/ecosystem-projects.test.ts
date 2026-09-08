import { test } from 'node:test';
import assert from 'node:assert/strict';
import { categoryLabel, newsDateLabel, filterProjects, isSafeExternalUrl, serializeJsonLd, ecosystemJsonLd, type EcosystemProject } from '../lib/ecosystem-projects';

const project: EcosystemProject = {
  id: 'test', name: 'Example', summary: 'A relay browser', category: 'Tools',
  status: 'beta', statusNote: 'Preview release', website: 'https://example.com',
  repository: '', lastVerified: '2026-09-08',
  people: [{ name: 'Alice', role: 'maintainer', profiles: [], sourceUrl: 'https://example.com/team' }],
  sources: [{ label: 'Project', url: 'https://example.com' }],
};
test('search trims whitespace and matches people, descriptions and names without case sensitivity', () => {
  for (const query of [' ALICE ', 'relay', 'EXAMPLE']) {
    assert.deepEqual(filterProjects([project], { query }), [project]);
  }
  assert.deepEqual(filterProjects([project], { query: 'missing' }), []);
});
test('category, status and search filters intersect and reset without mutating input', () => {
  const archived = { ...project, id: 'old', status: 'archived' as const };
  const input = [project, archived];
  assert.deepEqual(filterProjects(input, { query: 'relay', category: 'Tools', status: 'beta' }), [project]);
  assert.deepEqual(filterProjects(input, { category: 'Clients' }), []);
  assert.deepEqual(filterProjects(input, { status: 'unknown' }), []);
  assert.deepEqual(filterProjects(input, {}), input);
  assert.equal(input.length, 2);
});
test('external links permit only absolute HTTP(S) without credentials', () => {
  for (const url of ['https://example.com/a', 'http://example.com']) assert.equal(isSafeExternalUrl(url), true);
  for (const url of ['', '/news', '//example.com', 'javascript:alert(1)', 'data:text/html,x', 'https://user:pass@example.com', 'invalid']) assert.equal(isSafeExternalUrl(url), false);
});
test('collection JSON-LD uses actual directory entries and escapes script delimiters', () => {
  const data = { checkedAt: '2026-09-08', projects: [{ ...project, name: '</script><script>alert(1)</script>' }], news: [], security: [] };
  const ld = ecosystemJsonLd(data, 'https://nostr-wot.com/es/projects');
  assert.equal(ld.url, 'https://nostr-wot.com/es/projects');
  assert.equal(ld.mainEntity.itemListElement.length, 1);
  assert.equal(ld.mainEntity.itemListElement[0].item.name, data.projects[0].name);
  const serialized = serializeJsonLd(ld);
  assert.equal(serialized.includes('<'), false);
  assert.deepEqual(JSON.parse(serialized), ld);
  assert.equal(ecosystemJsonLd({ ...data, projects: [] }, ld.url).mainEntity.itemListElement.length, 0);
});

test('rendered cards keep maintainer evidence distinct from an unverified founder', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { default: Directory } = await import('../components/projects/EcosystemDirectory');
  const html = renderToStaticMarkup(createElement(Directory, {
    data: { checkedAt: '2026-09-08', projects: [project], news: [], security: [] },
    blogHref: '/es/blog', newsHref: '/es/news',
  }));
  assert.match(html, /Founder: not verified/);
  assert.match(html, /maintainer/);
  assert.match(html, /href="https:\/\/example.com\/team"/);
  assert.match(html, /<details/);
  assert.match(html, /<summary/);
  assert.match(html, /lang="en"/);
  assert.match(html, /href="\/es\/blog"/);
  assert.doesNotMatch(html, /Security reports/);
});

test('empty data renders preparation state; supplied reports render without invented links', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { default: Directory } = await import('../components/projects/EcosystemDirectory');
  const html = renderToStaticMarkup(createElement(Directory, {
    data: { checkedAt: '2026-09-08', projects: [], news: [], security: [{ title: 'A cited report', date: '2026-09-07', summary: 'Scope of this report', url: 'https://example.com/report' }] },
    blogHref: '/blog', newsHref: '/news',
  }));
  assert.match(html, /directory is being prepared/);
  assert.match(html, /Security reports/);
  assert.match(html, /href="https:\/\/example.com\/report"/);
  assert.doesNotMatch(html, /Recent ecosystem news/);
});


test('categories use human labels and tag/commit dates never become release dates', () => {
  assert.equal(categoryLabel('social-client'), 'Social client');
  assert.equal(categoryLabel('developer_tools'), 'Developer tools');
  assert.equal(newsDateLabel('tag commit date'), 'Commit date');
  assert.equal(newsDateLabel('commit'), 'Commit date');
  assert.equal(newsDateLabel('publication date'), 'Date');
});

test('security baseline preserves coverage, date basis and expandable source evidence', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { default: Directory } = await import('../components/projects/EcosystemDirectory');
  const html = renderToStaticMarkup(createElement(Directory, {
    data: { checkedAt: '2026-09-08', projects: [{ ...project, category: 'social-client' }], news: [], security: [{
      title: 'Baseline review', date: '2026-09-07', summary: 'Selected evidence only', url: 'https://example.com/report',
      type: 'baseline', coverage: 'Repository advisories', dateBasis: 'tag commit date',
      sources: [{ label: 'Tagged commit', url: 'https://example.com/commit' }],
    }] }, blogHref: '/blog', newsHref: '/news',
  }));
  assert.match(html, /Social client/);
  assert.match(html, /Baseline/);
  assert.match(html, /Commit date/);
  assert.match(html, /not a verified release date/);
  assert.match(html, /Repository advisories/);
  assert.match(html, /href="https:\/\/example.com\/commit"/);
  assert.match(html, /Summary &amp; evidence/);
});
