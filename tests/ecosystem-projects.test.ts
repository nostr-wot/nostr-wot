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
  const ld = ecosystemJsonLd(data, 'https://nostrwot.com/es/projects');
  assert.equal(ld.url, 'https://nostrwot.com/es/projects');
  assert.equal(ld.mainEntity.itemListElement.length, 1);
  assert.equal(ld.mainEntity.itemListElement[0].item.name, data.projects[0].name);
  const serialized = serializeJsonLd(ld);
  assert.equal(serialized.includes('<'), false);
  assert.deepEqual(JSON.parse(serialized), ld);
  assert.equal(ecosystemJsonLd({ ...data, projects: [] }, ld.url).mainEntity.itemListElement.length, 0);
});

// The person-level evidence this guards moved from the directory cards to each
// project's own page, so the assertions follow it there. The card is now a
// summary tile and is asserted separately not to carry the evidence block.
test('the project page keeps maintainer evidence distinct from an unverified founder', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { default: ProjectDetail } = await import('../components/projects/ProjectDetail');
  const data = { checkedAt: '2026-09-08', projects: [project], news: [], security: [] };
  const html = renderToStaticMarkup(createElement(ProjectDetail, {
    project, data, locale: 'en', directoryHref: '/projects',
  } as never));
  assert.match(html, /Founder: not verified/);
  // The role label is capitalised in the markup now rather than by CSS: a card
  // lists every role this project credits the person with, and
  // `first-letter:uppercase` only reached the first item of a joined list.
  assert.match(html, /Maintainer/);
  assert.match(html, /href="https:\/\/example.com\/team"/);
  assert.match(html, /lang="en"/);
  assert.match(html, /href="\/projects"/);
});

test('the directory card is a summary tile and does not repeat the evidence trail', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { default: Directory } = await import('../components/projects/EcosystemDirectory');
  const html = renderToStaticMarkup(createElement(Directory, {
    data: { checkedAt: '2026-09-08', projects: [project], news: [], security: [] },
    blogHref: '/es/blog', newsHref: '/es/news',
    peopleLink: { href: '/es/people', label: 'Personas' },
  }));
  // The card shows what identifies the project and links onward. It must not
  // duplicate the page it links to.
  assert.match(html, /Example/);
  assert.match(html, /A relay browser/);
  assert.match(html, /href="\/projects\/test"/);
  assert.doesNotMatch(html, /Founder: not verified/);
  assert.doesNotMatch(html, /Status evidence/);
  assert.doesNotMatch(html, /href="https:\/\/example.com\/team"/);
  // The former "Curated content" language strip is gone.
  assert.doesNotMatch(html, /Curated content/);
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
    peopleLink: { href: '/people', label: 'People' },
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
    peopleLink: { href: '/people', label: 'People' },
  }));
  assert.match(html, /Social client/);
  assert.match(html, /Baseline/);
  assert.match(html, /Commit date/);
  assert.match(html, /not a verified release date/);
  assert.match(html, /Repository advisories/);
  assert.match(html, /href="https:\/\/example.com\/commit"/);
  assert.match(html, /Summary &amp; evidence/);
});

test('Spanish UI translates controls, roles, dates and evidence without changing source URLs', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { default: Directory } = await import('../components/projects/EcosystemDirectory');
  const data = { checkedAt: '2026-09-08', projects: [{ ...project, category: 'social-client', status: 'unknown' as const,
    summary: 'Un explorador de relés', statusNote: '',
    people: [{ ...project.people[0], profiles: [{ label: 'Perfil', url: 'https://example.com/alice' }] }],
  }], news: [], security: [{ title: 'Revisión de seguridad', date: '2026-09-07', summary: 'Fuentes seleccionadas',
    url: 'https://example.com/report', type: 'baseline', dateBasis: 'tag commit date', coverage: 'Avisos del repositorio',
    sources: [{ label: 'Commit etiquetado', url: 'https://example.com/commit' }],
  }] };
  const html = renderToStaticMarkup(createElement(Directory, { locale: 'es', data, blogHref: '/es/blog', newsHref: '/es/news', peopleLink: { href: '/es/people', label: 'Personas' } }));
  const { default: ProjectDetail } = await import('../components/projects/ProjectDetail');
  // Person-level evidence is rendered by the project page now, so the Spanish
  // check spans both surfaces rather than dropping half its assertions.
  const page = renderToStaticMarkup(createElement(ProjectDetail, {
    project: data.projects[0], data, locale: 'es', directoryHref: '/es/projects',
  } as never));
  for (const text of ['lang="es"', 'Buscar proyectos o personas', 'Todas las categorías', 'Todos los estados', 'Cliente social', 'Desconocido', 'Informes de seguridad', 'Contexto inicial']) assert.ok(html.includes(text), `directory: ${text}`);
  // The directory's own "checked on" line was removed; the date is stated on
  // each project's page instead, so the localised date format is asserted there.
  for (const text of ['lang="es"', 'Responsable de mantenimiento', 'Fundador: no verificado', 'Fuentes', '8 de septiembre de 2026']) assert.ok(page.includes(text), `project page: ${text}`);
  for (const url of ['https://example.com/commit', 'https://example.com/report']) assert.ok(html.includes(`href="${url}"`), url);
  for (const url of ['https://example.com/team', 'https://example.com/alice']) assert.ok(page.includes(`href="${url}"`), url);
  assert.doesNotMatch(html, /Curated content|Search projects|Commit date|link unavailable/);
  assert.doesNotMatch(page, /Founder: not verified|Search projects/);
});

test('Spanish and French empty states and JSON-LD honor their page language', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { default: Directory } = await import('../components/projects/EcosystemDirectory');
  const data = { checkedAt: '2026-09-08', projects: [], news: [], security: [] };
  const html = renderToStaticMarkup(createElement(Directory, { locale: 'es', data, blogHref: '/es/blog', newsHref: '/es/news', peopleLink: { href: '/es/people', label: 'Personas' } }));
  assert.match(html, /El directorio está en preparación/);
  assert.doesNotMatch(html, /English|inglés/);
  const french = renderToStaticMarkup(createElement(Directory, { locale: 'fr', data, blogHref: '/fr/blog', newsHref: '/fr/news', peopleLink: { href: '/fr/people', label: 'Personnes' } }));
  assert.match(french, /lang="fr"/);
  assert.doesNotMatch(french, /Curated content · English/);
  assert.equal(ecosystemJsonLd(data, 'https://nostrwot.com/es/projects', 'es').inLanguage, 'es');
  assert.equal(ecosystemJsonLd(data, 'https://nostrwot.com/fr/projects', 'fr').inLanguage, 'fr');
});

test('Spanish dataset preserves the English source URLs and dated evidence', async () => {
  const { readFile } = await import('node:fs/promises');
  const english = JSON.parse(await readFile(new URL('../data/ecosystem-projects.json', import.meta.url), 'utf8'));
  const spanish = JSON.parse(await readFile(new URL('../data/ecosystem-projects.es.json', import.meta.url), 'utf8'));
  const evidenceKeys = new Set(['id', 'url', 'website', 'repository', 'sourceUrl', 'date', 'checkedAt', 'lastVerified', 'status', 'role', 'category', 'type', 'dateBasis']);
  function evidence(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(evidence);
    if (!value || typeof value !== 'object') return value;
    return Object.fromEntries(Object.entries(value).filter(([key, item]) => evidenceKeys.has(key) || (item !== null && typeof item === 'object')).map(([key, item]) => [key, evidence(item)]));
  }
  assert.deepEqual(evidence(spanish), evidence(english));
});

test('directory UI and structured data honor all seven page languages', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { default: Directory } = await import('../components/projects/EcosystemDirectory');
  const { ecosystemCopy } = await import('../lib/ecosystem-projects');
  for (const locale of ['en', 'es', 'de', 'fr', 'it', 'pt', 'ru']) {
    const data = { checkedAt: '2026-09-08', projects: [project], news: [], security: [] };
    const html = renderToStaticMarkup(createElement(Directory, { data, locale, blogHref: '/blog', newsHref: '/news', peopleLink: { href: '/people', label: 'People' } }));
    assert.ok(html.includes(`lang="${locale}"`), locale);
    assert.equal(ecosystemJsonLd(data, `https://nostrwot.com/${locale}/projects`, locale).inLanguage, locale);
    if (locale !== 'en') assert.notEqual(ecosystemCopy(locale).heading, ecosystemCopy('en').heading, locale);
  }
});
