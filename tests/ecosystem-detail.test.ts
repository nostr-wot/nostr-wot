import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { EcosystemData, EcosystemProject } from '../lib/ecosystem-projects';
import type { ProjectSnapshot } from '../lib/ecosystem-snapshot';

test('StatusBadge renders the per-status colour and the localised label', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { StatusBadge } = await import('../components/projects/shared');
  const cases: [string, string, string][] = [
    ['active', 'bg-emerald-100', 'Active'],
    ['beta', 'bg-amber-100', 'Beta'],
    ['archived', 'bg-gray-200', 'Archived'],
    ['unknown', 'bg-violet-100', 'Unknown'],
  ];
  for (const [status, className, label] of cases) {
    const html = renderToStaticMarkup(createElement(StatusBadge, { status, locale: 'en' } as never));
    assert.ok(html.includes(className), `${status}: ${className}`);
    assert.ok(html.includes(label), `${status}: ${label}`);
  }
  const spanish = renderToStaticMarkup(createElement(StatusBadge, { status: 'archived', locale: 'es' } as never));
  assert.ok(spanish.includes('Archivado'), spanish);
});

test('ExternalLink degrades to plain text when the URL is unsafe', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { ExternalLink } = await import('../components/projects/shared');
  const safe = renderToStaticMarkup(createElement(ExternalLink, { url: 'https://example.com', locale: 'en', children: 'Label' }));
  assert.match(safe, /<a href="https:\/\/example\.com"/);
  // Outbound links open in a new tab. `noopener` is what makes that safe
  // against reverse tabnabbing, and `nofollow` matches the directory's own
  // statement that inclusion is not an endorsement. `noreferrer` is
  // deliberately absent so linked projects still see the referral.
  assert.match(safe, /target="_blank"/);
  assert.match(safe, /rel="nofollow noopener"/);
  assert.doesNotMatch(safe, /noreferrer/);
  assert.match(safe, /opens in a new tab/);
  for (const url of ['javascript:alert(1)', '/relative', '']) {
    const unsafe = renderToStaticMarkup(createElement(ExternalLink, { url, locale: 'en', children: 'Label' }));
    assert.doesNotMatch(unsafe, /<a /);
    assert.match(unsafe, /link unavailable/);
  }
});

test('related reports match on repository slug in any evidence URL, never on names', async () => {
  const { relatedReports, repositorySlug, findProject } = await import('../lib/ecosystem-projects');
  assert.equal(repositorySlug('https://github.com/greenart7c3/Amber'), 'greenart7c3/Amber');
  assert.equal(repositorySlug('https://example.com/x'), null);

  const data = {
    checkedAt: '2026-10-04',
    projects: [
      { id: 'amber', name: 'Amber', summary: 's', category: 'signer', status: 'active' as const,
        statusNote: 'n', website: 'https://github.com/greenart7c3/Amber',
        repository: 'https://github.com/greenart7c3/Amber', lastVerified: '2026-10-04',
        people: [], sources: [{ label: 'README', url: 'https://github.com/greenart7c3/Amber' }] },
      { id: 'lonely', name: 'Amber Clone', summary: 's', category: 'signer', status: 'active' as const,
        statusNote: 'n', website: 'https://example.com',
        repository: 'https://github.com/someone/else', lastVerified: '2026-10-04',
        people: [], sources: [{ label: 'README', url: 'https://example.com' }] },
    ],
    news: [
      { title: 'Amber v6.6.5', date: '2026-09-21', summary: 's',
        url: 'https://github.com/greenart7c3/Amber/releases/tag/v6.6.5' },
      { title: 'Unrelated', date: '2026-09-01', summary: 's', url: 'https://example.net/x' },
    ],
    security: [
      { title: 'Amber hardening', date: '2026-09-21', summary: 's', url: 'https://example.net/y',
        sources: [{ label: 'commit', url: 'https://github.com/greenart7c3/Amber/commit/abc' }] },
    ],
  };

  assert.equal(findProject(data, 'amber')?.name, 'Amber');
  assert.equal(findProject(data, 'missing'), undefined);

  const amber = relatedReports(data.projects[0], data);
  assert.deepEqual(amber.news.map(r => r.title), ['Amber v6.6.5']);
  assert.deepEqual(amber.security.map(r => r.title), ['Amber hardening']);

  // "Amber Clone" shares the project NAME but not the repository slug.
  const lonely = relatedReports(data.projects[1], data);
  assert.deepEqual(lonely, { news: [], security: [] });
});

test('matching is case insensitive on the slug and survives real data', async () => {
  const { relatedReports } = await import('../lib/ecosystem-projects');
  const { readFileSync } = await import('node:fs');
  const data = JSON.parse(readFileSync(new URL('../data/ecosystem-projects.json', import.meta.url), 'utf8'));
  const matched = data.projects.filter((p: never) => {
    const r = relatedReports(p, data);
    return r.news.length + r.security.length > 0;
  });
  // Measured on the 2026-10-04 dataset. If this number moves, the dataset
  // changed; confirm the new value is right rather than loosening the test.
  assert.equal(matched.length, 5);
});

test('every project composes a title and description inside the policy window', async () => {
  const { projectTitle, projectDescription } = await import('../lib/project-seo');
  const { SEO_LIMITS } = await import('../lib/metadata-policy');
  const { readFileSync } = await import('node:fs');
  const [titleMin, titleMax] = SEO_LIMITS.title;
  const [descMin, descMax] = SEO_LIMITS.description;

  for (const locale of ['en', 'es', 'pt', 'ru', 'it', 'fr', 'de']) {
    const file = locale === 'en' ? 'ecosystem-projects.json' : `ecosystem-projects.${locale}.json`;
    const data = JSON.parse(readFileSync(new URL(`../data/${file}`, import.meta.url), 'utf8'));
    for (const project of data.projects) {
      const title = projectTitle(project, locale);
      const length = Array.from(title).length;
      assert.ok(length >= titleMin && length <= titleMax,
        `${locale}/${project.id}: title is ${length} chars: ${title}`);

      const description = projectDescription(project, locale);
      const dLength = Array.from(description).length;
      // Both bounds, unconditionally. This used to exempt projects whose
      // summary was already longer than the upper bound, because those came
      // back as an ellipsis excerpt; no translated summary overflows the
      // ceiling any more, so the exemption only hid the next one. Over the
      // upper bound the copy is cut mid-sentence; under the lower bound
      // `withMetadataPolicy` pads it with generic site filler.
      assert.ok(dLength >= descMin && dLength <= descMax,
        `${locale}/${project.id}: description is ${dLength} chars, outside [${descMin}, ${descMax}]: ${description}`);
    }
  }
});

test('project JSON-LD describes the software, cites its sources and breadcrumbs correctly', async () => {
  const { projectJsonLd } = await import('../lib/project-seo');
  const project = {
    id: 'snort', name: 'Snort', summary: 'A Nostr web client.', category: 'social-client',
    status: 'active' as const, statusNote: 'note', website: 'https://snort.social',
    repository: 'https://github.com/v0l/snort', lastVerified: '2026-10-04', people: [],
    sources: [{ label: 'README', url: 'https://github.com/v0l/snort/blob/main/README.md' }],
  };
  const snapshot = {
    slug: 'v0l/snort', canonicalSlug: 'v0l/snort', archived: false,
    createdAt: '2022-12-18', pushedAt: '2026-09-30', license: 'MIT', language: 'TypeScript',
    topics: ['nostr'], releases: [
      { tag: 'v0.6.0-rc1', date: '2026-05-01', url: 'https://e.com/rc', prerelease: true },
      { tag: 'v0.5.3', date: '2026-04-08', url: 'https://e.com/5', prerelease: false },
    ],
  };
  const graphs = projectJsonLd({ project, snapshot, url: 'https://nostrwot.com/projects/snort', locale: 'en' }) as any[];
  const app = graphs.find(g => g['@type'] === 'SoftwareApplication');
  const crumbs = graphs.find(g => g['@type'] === 'BreadcrumbList');

  assert.equal(app.name, 'Snort');
  assert.equal(app.url, 'https://snort.social');
  assert.equal(app.codeRepository, 'https://github.com/v0l/snort');
  assert.equal(app.license, 'https://spdx.org/licenses/MIT.html');
  assert.equal(app.programmingLanguage, 'TypeScript');
  assert.equal(app.datePublished, '2022-12-18');
  assert.equal(app.dateModified, '2026-09-30');
  // A prerelease must never be presented as the current version.
  assert.equal(app.softwareVersion, 'v0.5.3');
  assert.deepEqual(app.citation.map((c: any) => c.url), ['https://github.com/v0l/snort/blob/main/README.md']);
  assert.equal(app.mainEntityOfPage['@id'], 'https://nostrwot.com/projects/snort');
  assert.equal(crumbs.itemListElement.length, 3);
  assert.deepEqual(crumbs.itemListElement.map((i: any) => i.name), ['Nostr WoT', 'Projects', 'Snort']);

  // No unsafe or absent values may leak into the graph.
  const archived = projectJsonLd({
    project: { ...project, website: 'javascript:alert(1)' },
    snapshot: { ...snapshot, license: null, language: null, releases: [] },
    url: 'https://nostrwot.com/projects/snort', locale: 'en',
  }) as any[];
  const bare = archived.find(g => g['@type'] === 'SoftwareApplication');
  assert.ok(!('url' in bare), 'unsafe website must be omitted, not rendered');
  assert.ok(!('license' in bare));
  assert.ok(!('programmingLanguage' in bare));
  assert.ok(!('softwareVersion' in bare));
  assert.ok(!JSON.stringify(archived).includes('javascript:'));
});

test('composed copy claims only what every record actually carries', async () => {
  const { ecosystemDetail, projectTitle, projectDescription } = await import('../lib/project-seo');
  const { isSafeExternalUrl } = await import('../lib/ecosystem-projects');
  const { readFileSync } = await import('node:fs');
  // The fitter picks a sentence by length alone, with no sight of the project,
  // so an authored sentence may only state what every record holds. These words
  // name per-project facts most records do not have: 36 of the 42 projects list
  // no people, five have no license and 17 have no published release.
  const perProjectClaims: Record<string, RegExp> = {
    en: /people|maintainer|licen[cs]e|language|release|topic/i,
    es: /personas|mantenedor|licencia|lenguaje|versiones|temas/i,
    pt: /pessoas|mantenedor|licença|linguagem|versões|tópicos/i,
    ru: /люд|лиценз|язык|версий|версии|выпуск|темы/i,
    it: /persone|licenza|linguaggio|versioni|argomenti/i,
    fr: /personnes|licence|langage|versions|sujets/i,
    de: /personen|lizenz|sprache|release|themen/i,
  };
  const clean = (text: string) => text.normalize('NFC').replace(/\s+/gu, ' ').trim();

  for (const [locale, claim] of Object.entries(perProjectClaims)) {
    const copy = ecosystemDetail(locale);
    for (const authored of [...copy.titleTemplates, ...copy.descriptionSuffixes]) {
      assert.doesNotMatch(authored, claim, `${locale}: "${authored}" promises a fact a record may not hold`);
    }

    // What the authored copy does claim, every record must carry, or it is
    // false in exactly the same way: a status note, cited sources, the date it
    // was verified, and a linked source repository.
    const file = locale === 'en' ? 'ecosystem-projects.json' : `ecosystem-projects.${locale}.json`;
    const data = JSON.parse(readFileSync(new URL(`../data/${file}`, import.meta.url), 'utf8'));
    for (const project of data.projects) {
      assert.ok(project.statusNote.trim(), `${locale}/${project.id}: status claimed with no note`);
      assert.ok(project.sources.length >= 2, `${locale}/${project.id}: ${project.sources.length} cited sources`);
      assert.match(project.lastVerified, /^\d{4}-\d{2}-\d{2}$/, `${locale}/${project.id}: no verified date`);
      assert.ok(isSafeExternalUrl(project.repository), `${locale}/${project.id}: no linked repository`);

      // Nothing but the summary, or a word-boundary excerpt of it, plus the
      // authored sentences ever reaches the page. Generic filler from the
      // metadata policy would survive this stripping and fail here.
      const whole: string = copy.descriptionSuffixes.reduce(
        (text: string, suffix: string) => text.split(` ${suffix}`).join(''),
        projectDescription(project, locale).replace(/…$/u, ''));
      // An excerpt can cut the last authored sentence anywhere, so also drop a
      // trailing fragment of one.
      const fragment = copy.descriptionSuffixes.flatMap((suffix: string) =>
        Array.from({ length: suffix.length }, (_, size) => ` ${suffix.slice(0, suffix.length - size)}`))
        .find((start: string) => whole.endsWith(start));
      const body = (fragment ? whole.slice(0, -fragment.length) : whole).replace(/[\s,:;.|-]+$/u, '');
      assert.ok(clean(project.summary).startsWith(body),
        `${locale}/${project.id}: description adds text of its own: ${body}`);
      assert.ok(projectTitle(project, locale).includes(project.name), `${locale}/${project.id}: title drops the name`);
    }
  }
});

test('the detail page shows every evidence section in each locale and invents nothing', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { default: ProjectDetail } = await import('../components/projects/ProjectDetail');
  const { readFileSync } = await import('node:fs');

  for (const locale of ['en', 'es', 'pt', 'ru', 'it', 'fr', 'de']) {
    const file = locale === 'en' ? 'ecosystem-projects.json' : `ecosystem-projects.${locale}.json`;
    const data = JSON.parse(readFileSync(new URL(`../data/${file}`, import.meta.url), 'utf8'));
    const project = data.projects.find((p: { id: string }) => p.id === 'amber');
    const html = renderToStaticMarkup(createElement(ProjectDetail, {
      project, data, locale, directoryHref: locale === 'en' ? '/projects' : `/${locale}/projects`,
    } as never));

    assert.ok(html.includes(project.summary), `${locale}: summary missing`);
    assert.ok(html.includes(project.statusNote), `${locale}: status note missing`);
    assert.ok(html.includes('github.com/greenart7c3/Amber'), `${locale}: repository link missing`);
    assert.ok(html.includes(`href="${locale === 'en' ? '/projects' : `/${locale}/projects`}"`), `${locale}: back link missing`);
    // Amber is one of the five projects with matched reports.
    assert.ok(html.includes('v6.6.5'), `${locale}: related reports missing`);
    if (locale !== 'en') {
      const english = JSON.parse(readFileSync(new URL('../data/ecosystem-projects.json', import.meta.url), 'utf8'));
      const englishAmber = english.projects.find((p: { id: string }) => p.id === 'amber');
      assert.ok(!html.includes(englishAmber.summary), `${locale}: English summary leaked`);
    }
  }
});

test('a project with no related reports omits those sections entirely', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { default: ProjectDetail } = await import('../components/projects/ProjectDetail');
  const { readFileSync } = await import('node:fs');
  const data = JSON.parse(readFileSync(new URL('../data/ecosystem-projects.json', import.meta.url), 'utf8'));
  const project = data.projects.find((p: { id: string }) => p.id === 'shopstr');
  const html = renderToStaticMarkup(createElement(ProjectDetail, {
    project, data, locale: 'en', directoryHref: '/projects',
  } as never));
  assert.doesNotMatch(html, /Related ecosystem news/);
  assert.doesNotMatch(html, /Related security reports/);
  assert.match(html, /Repository facts/);
});

test('the repository-rename row appears only when the snapshot resolves to a different slug', async () => {
  // Task 2 established that no real project's snapshot has a canonicalSlug
  // different from its slug: all 42 repository URLs were already written
  // from GitHub's canonical full_name, so this path has no real-data
  // coverage. ProjectDetail accepts an optional `snapshot` prop (defaulting
  // to its own getProjectSnapshot(project.id) lookup when omitted) precisely
  // so a fixture snapshot can be injected here without touching real data.
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { default: ProjectDetail } = await import('../components/projects/ProjectDetail');
  const { ecosystemDetail } = await import('../lib/project-seo');
  const renamedLabel = ecosystemDetail('en').renamedFrom;

  const project: EcosystemProject = {
    id: 'rename-fixture',
    name: 'Rename Fixture',
    summary: 'A fixture project for the rename row.',
    category: 'tools',
    status: 'active',
    statusNote: 'Fixture note.',
    website: 'https://example.com',
    repository: 'https://github.com/new-owner/new-repo',
    lastVerified: '2026-10-04',
    people: [],
    sources: [{ label: 'Fixture source', url: 'https://example.com/source' }],
  };
  const data: EcosystemData = { checkedAt: '2026-10-04', projects: [project], news: [], security: [] };
  const sameSlugSnapshot: ProjectSnapshot = {
    slug: 'new-owner/new-repo',
    canonicalSlug: 'new-owner/new-repo',
    archived: false,
    createdAt: '2020-01-01',
    pushedAt: '2026-01-01',
    license: 'MIT',
    language: 'TypeScript',
    topics: [],
    releases: [],
  };
  const renamedSnapshot: ProjectSnapshot = { ...sameSlugSnapshot, slug: 'old-owner/old-repo' };

  const renamedHtml = renderToStaticMarkup(createElement(ProjectDetail, {
    project, data, locale: 'en', snapshot: renamedSnapshot,
  }));
  assert.ok(renamedHtml.includes(renamedLabel), 'rename row missing when canonicalSlug differs from slug');
  assert.ok(renamedHtml.includes('new-owner/new-repo'), 'canonical slug text missing');
  assert.ok(renamedHtml.includes('href="https://github.com/new-owner/new-repo"'), 'canonical slug link missing');

  const sameHtml = renderToStaticMarkup(createElement(ProjectDetail, {
    project, data, locale: 'en', snapshot: sameSlugSnapshot,
  }));
  assert.ok(!sameHtml.includes(renamedLabel), 'rename row must be absent when canonicalSlug equals slug');
});

test('the route enumerates every project in every locale', async () => {
  const { generateStaticParams } = await import('../app/[locale]/projects/[id]/page');
  const { locales } = await import('../i18n/config');
  const { readFileSync } = await import('node:fs');
  const data = JSON.parse(readFileSync(new URL('../data/ecosystem-projects.json', import.meta.url), 'utf8'));
  const params = await generateStaticParams();
  assert.equal(params.length, locales.length * data.projects.length);
  assert.equal(new Set(params.map((p: { locale: string; id: string }) => `${p.locale}/${p.id}`)).size, params.length);
  for (const locale of locales) {
    assert.ok(params.some((p: { locale: string; id: string }) => p.locale === locale && p.id === 'amber'), locale);
  }
});

test('every project id has a snapshot entry and the snapshot invents none', async () => {
  const { snapshotIds, snapshotGeneratedAt } = await import('../lib/ecosystem-snapshot');
  const { readFileSync } = await import('node:fs');
  const data = JSON.parse(readFileSync(new URL('../data/ecosystem-projects.json', import.meta.url), 'utf8'));
  const ids = new Set<string>(data.projects.map((p: { id: string }) => p.id));
  assert.deepEqual(new Set(snapshotIds()), ids, 'dataset and snapshot have drifted');
  assert.match(snapshotGeneratedAt(), /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(snapshotGeneratedAt() <= new Date().toISOString().slice(0, 10), 'snapshot is dated in the future');
});

test('snapshot evidence URLs are https and safe', async () => {
  const { getProjectSnapshot, snapshotIds } = await import('../lib/ecosystem-snapshot');
  const { isSafeExternalUrl } = await import('../lib/ecosystem-projects');
  const today = new Date().toISOString().slice(0, 10);
  for (const id of snapshotIds()) {
    const snapshot = getProjectSnapshot(id)!;
    for (const date of [snapshot.createdAt, snapshot.pushedAt]) {
      assert.match(date, /^\d{4}-\d{2}-\d{2}$/, id);
      assert.ok(date <= today, `${id}: ${date} is in the future`);
    }
    for (const release of snapshot.releases) {
      assert.ok(release.url.startsWith('https://') && isSafeExternalUrl(release.url), `${id}: ${release.url}`);
      assert.ok(release.date <= today, `${id}: release ${release.tag} is dated in the future`);
    }
  }
});

test('each directory card links to its evidence page and the collection graph points at them', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { default: Directory } = await import('../components/projects/EcosystemDirectory');
  const { ecosystemJsonLd } = await import('../lib/ecosystem-projects');
  const { readFileSync } = await import('node:fs');
  const data = JSON.parse(readFileSync(new URL('../data/ecosystem-projects.json', import.meta.url), 'utf8'));

  const html = renderToStaticMarkup(createElement(Directory, {
    data, locale: 'en', blogHref: '/blog', newsHref: '/news',
    peopleLink: { href: '/people', label: 'People in the directory' },
  } as never));
  assert.match(html, /href="\/projects\/amber"/);

  const spanish = renderToStaticMarkup(createElement(Directory, {
    data, locale: 'es', blogHref: '/es/blog', newsHref: '/es/news',
    peopleLink: { href: '/es/people', label: 'Personas en el directorio' },
  } as never));
  assert.match(spanish, /href="\/es\/projects\/amber"/);

  const ld = ecosystemJsonLd(data, 'https://nostrwot.com/projects', 'en') as never as {
    mainEntity: { itemListElement: { item: { url: string; sameAs?: string } }[] };
  };
  const amber = ld.mainEntity.itemListElement.find(entry => entry.item.url.endsWith('/projects/amber'));
  assert.ok(amber, 'collection graph does not link the project page');
  assert.equal(amber!.item.sameAs, 'https://github.com/greenart7c3/Amber');
});

test('the snapshot and the dataset agree on whether each project is archived', async () => {
  const { getProjectSnapshot } = await import('../lib/ecosystem-snapshot');
  const { readFileSync } = await import('node:fs');
  const data = JSON.parse(readFileSync(new URL('../data/ecosystem-projects.json', import.meta.url), 'utf8'));
  // `archived` is collected from GitHub and `status` is human judgement, and
  // the page renders only the second one. Nothing else compares them, so a
  // manual `npm run ecosystem:snapshot` could leave GitHub saying archived
  // while the page still shows a green Active badge, a status note asserting
  // recent development and a last-push date, with nothing flagging the
  // conflict. This is the only thing standing between that and an evidence
  // page. Re-verify the named record rather than loosening the assertion.
  for (const project of data.projects as { id: string; status: string }[]) {
    const snapshot = getProjectSnapshot(project.id);
    assert.ok(snapshot, `${project.id}: no snapshot entry`);
    assert.equal(snapshot!.archived, project.status === 'archived',
      `${project.id}: the snapshot says archived=${snapshot!.archived} but the dataset says status="${project.status}"`);
  }
});

test('the detail page renders the latest recorded update and both verification dates', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { default: ProjectDetail } = await import('../components/projects/ProjectDetail');
  const { ecosystemCopy, ecosystemDate } = await import('../lib/ecosystem-projects');
  const { readFileSync } = await import('node:fs');

  // The card calls this link the full evidence record, so the page may not show
  // less dataset evidence than the card's own collapsed block. 16 of the 42
  // records carry a `latestUpdate`; `checkedAt` is the directory's own
  // verification date, which the spec requires beside the project's.
  for (const locale of ['en', 'es', 'pt', 'ru', 'it', 'fr', 'de']) {
    const file = locale === 'en' ? 'ecosystem-projects.json' : `ecosystem-projects.${locale}.json`;
    const data = JSON.parse(readFileSync(new URL(`../data/${file}`, import.meta.url), 'utf8'));
    const t = ecosystemCopy(locale);
    const project = data.projects.find((p: { id: string }) => p.id === 'amber');
    assert.ok(project.latestUpdate, `${locale}: the amber fixture lost its latestUpdate`);
    const html = renderToStaticMarkup(createElement(ProjectDetail, {
      project, data, locale, directoryHref: locale === 'en' ? '/projects' : `/${locale}/projects`,
    } as never));

    assert.ok(html.includes(t.latestUpdate), `${locale}: latest-update label missing`);
    assert.ok(html.includes(project.latestUpdate.title), `${locale}: latest-update title missing`);
    assert.ok(html.includes(`href="${project.latestUpdate.url}"`), `${locale}: latest-update link missing`);
    // React preserves the JSX spelling of the attribute in static markup, so
    // match it without caring which casing a future React emits.
    const timeElement = (value: string) => new RegExp(`<time datetime="${value}"`, 'i');
    assert.match(html, timeElement(project.latestUpdate.date), `${locale}: latest-update date not a <time>`);
    assert.ok(html.includes(ecosystemDate(project.latestUpdate.date, locale)), `${locale}: latest-update date unformatted`);

    assert.ok(html.includes(t.lastChecked), `${locale}: project verification date missing`);
    assert.ok(html.includes(t.directoryChecked), `${locale}: directory verification date missing`);
    assert.match(html, timeElement(data.checkedAt), `${locale}: checkedAt not a <time>`);
    assert.ok(html.includes(ecosystemDate(data.checkedAt, locale)), `${locale}: checkedAt unformatted`);
  }

  // A record without one must not render an empty latest-update row.
  const data = JSON.parse(readFileSync(new URL('../data/ecosystem-projects.json', import.meta.url), 'utf8'));
  const shopstr = data.projects.find((p: { id: string }) => p.id === 'shopstr');
  assert.ok(!shopstr.latestUpdate, 'the shopstr fixture gained a latestUpdate');
  const bare = renderToStaticMarkup(createElement(ProjectDetail, {
    project: shopstr, data, locale: 'en', directoryHref: '/projects',
  } as never));
  assert.ok(!bare.includes(ecosystemCopy('en').latestUpdate), 'latest-update row rendered with nothing to show');
  assert.ok(bare.includes(ecosystemCopy('en').directoryChecked), 'directory verification date missing');
});

test('no composed description is cut mid-word in any locale', async () => {
  const { projectDescription, ecosystemDetail } = await import('../lib/project-seo');
  const { SEO_LIMITS } = await import('../lib/metadata-policy');
  const { readFileSync } = await import('node:fs');
  const [descMin, descMax] = SEO_LIMITS.description;
  const clean = (text: string) => text.normalize('NFC').replace(/\s+/gu, ' ').trim();
  const length = (text: string) => Array.from(text).length;

  // WHAT THIS GUARANTEES. A description ending in an ellipsis was cut from some
  // composition of the project's own summary with the authored suffixes
  // appended, in the order the fitter appends them. Truncation only ever drops
  // characters from the end and then strips trailing whitespace or punctuation,
  // so the body (the description minus that ellipsis) stays a prefix of that
  // composition, and the single character the composition carries at the cut
  // position decides whether a token was split: a letter or digit there means
  // the cut landed inside a word.
  //
  // WHAT IT DOES NOT GUARANTEE. It says nothing about descriptions that were
  // never truncated, and nothing about whether a cut reads well. In particular
  // a hyphen is not a word character, so cutting the German compound
  // "Android-Veröffentlichung" down to "Android…" passes: the token is split at
  // its own hyphen, which is a real boundary, but it is not a cut between two
  // whole words. It also only requires that SOME valid composition has a
  // boundary at the cut, not that the fitter chose that exact composition.
  const compositions = (summary: string, suffixes: string[]) => {
    let frontier = [clean(summary)];
    const all = [...frontier];
    for (let depth = 0; depth < 3; depth++) {
      frontier = frontier.flatMap(text => suffixes.map(suffix => clean(`${text} ${suffix}`)));
      all.push(...frontier);
    }
    return all;
  };

  const truncated: Record<string, string[]> = {};
  for (const locale of ['en', 'es', 'pt', 'ru', 'it', 'fr', 'de']) {
    const file = locale === 'en' ? 'ecosystem-projects.json' : `ecosystem-projects.${locale}.json`;
    const data = JSON.parse(readFileSync(new URL(`../data/${file}`, import.meta.url), 'utf8'));
    const suffixes: string[] = ecosystemDetail(locale).descriptionSuffixes;
    truncated[locale] = [];

    for (const project of data.projects) {
      const description = projectDescription(project, locale);
      if (!description.endsWith('…')) continue;
      truncated[locale].push(project.id);

      // An excerpt still has to land inside the window: below the lower bound
      // `withMetadataPolicy` pads it with generic site filler.
      const size = length(description);
      assert.ok(size >= descMin && size <= descMax,
        `${locale}/${project.id}: excerpt is ${size} chars, outside [${descMin}, ${descMax}]: ${description}`);

      const body = description.slice(0, -1);
      const cutOnABoundary = compositions(project.summary, suffixes).some(source => {
        if (!source.startsWith(body)) return false;
        const next = Array.from(source.slice(body.length))[0];
        return next === undefined || !/[\p{L}\p{N}]/u.test(next);
      });
      assert.ok(cutOnABoundary,
        `${locale}/${project.id}: cut mid-word: ...${body.slice(-48)}…`);
    }
  }

  // No description is cut at all any more, in any locale. This was a snapshot
  // of how many were (es 5, pt 3, ru 2, it 4, fr 5, de 4); the translated
  // summaries that overflowed the ceiling have been tightened to fit it, and
  // `fitText` no longer reaches `min` by overshooting `max`. A meta description
  // ending mid-sentence is a defect, not a quantity to track, so the assertion
  // is now that there are none: a new project whose summary does not fit has to
  // be shortened like the others, and the per-project checks above still hold
  // the line on where a cut may fall if one is ever reached again.
  assert.deepEqual(
    Object.fromEntries(Object.entries(truncated).map(([locale, ids]) => [locale, ids])),
    { en: [], es: [], pt: [], ru: [], it: [], fr: [], de: [] });
});

test('every outbound link opens a new tab with nofollow, and no internal link does', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { default: Directory } = await import('../components/projects/EcosystemDirectory');
  const { default: ProjectDetail } = await import('../components/projects/ProjectDetail');
  const { readFileSync } = await import('node:fs');
  const data = JSON.parse(readFileSync(new URL('../data/ecosystem-projects.json', import.meta.url), 'utf8'));
  const project = data.projects.find((p: { id: string }) => p.id === 'amber');

  // Both surfaces, so neither can drift from the policy independently.
  const pages = [
    renderToStaticMarkup(createElement(Directory, { data, locale: 'en', blogHref: '/blog', newsHref: '/news', peopleLink: { href: '/people', label: 'People in the directory' } } as never)),
    renderToStaticMarkup(createElement(ProjectDetail, { project, data, locale: 'en', directoryHref: '/projects' } as never)),
  ];

  let external = 0;
  let internal = 0;
  for (const html of pages) {
    for (const tag of html.match(/<a\b[^>]*>/g) ?? []) {
      const href = /href="([^"]*)"/.exec(tag)?.[1] ?? '';
      if (/^https?:\/\//.test(href)) {
        external += 1;
        assert.match(tag, /target="_blank"/, `outbound link does not open a new tab: ${tag}`);
        assert.match(tag, /rel="[^"]*\bnofollow\b[^"]*"/, `outbound link is missing nofollow: ${tag}`);
        assert.match(tag, /rel="[^"]*\bnoopener\b[^"]*"/, `outbound link is missing noopener: ${tag}`);
      } else {
        internal += 1;
        // Internal navigation must stay in the same tab, and must never be
        // marked nofollow: these are our own pages and should be crawled.
        assert.doesNotMatch(tag, /target=/, `internal link opens a new tab: ${tag}`);
        assert.doesNotMatch(tag, /nofollow/, `internal link is marked nofollow: ${tag}`);
      }
    }
  }
  // Guards against the assertions passing because nothing was classified.
  assert.ok(external > 50, `expected many outbound links, counted ${external}`);
  assert.ok(internal > 5, `expected several internal links, counted ${internal}`);
});

test('every project has a logo record, each file exists, and none is a personal avatar', async () => {
  const { readFileSync, existsSync, statSync } = await import('node:fs');
  const { logoIds, getProjectLogo } = await import('../lib/project-logos');
  const data = JSON.parse(readFileSync(new URL('../data/ecosystem-projects.json', import.meta.url), 'utf8'));
  const manifest = JSON.parse(readFileSync(new URL('../data/project-logos.json', import.meta.url), 'utf8'));
  const ids: string[] = data.projects.map((p: { id: string }) => p.id);

  // Drift in either direction is a bug: a project with no record would render
  // nothing silently, and a record with no project is dead weight.
  assert.deepEqual(new Set(logoIds()), new Set(ids), 'dataset and logo manifest have drifted');

  let withLogo = 0;
  for (const id of ids) {
    const record = manifest.logos[id];
    if (!record.file) {
      // An absent logo must say why, so nobody has to re-derive it later.
      assert.ok(record.reason?.trim(), `${id}: no logo and no reason given`);
      assert.equal(getProjectLogo(id), undefined, `${id}: accessor returned a logo for a null record`);
      continue;
    }
    withLogo += 1;
    const logo = getProjectLogo(id)!;
    const path = new URL(`../public/${logo.file}`, import.meta.url);
    assert.ok(existsSync(path), `${id}: ${logo.file} is in the manifest but not on disk`);
    assert.equal(statSync(path).size, logo.bytes, `${id}: recorded byte count does not match the file`);
    assert.ok(logo.bytes <= 300_000, `${id}: ${logo.bytes} bytes is too large to ship`);
    assert.ok(logo.width > 0 && logo.height > 0, `${id}: ${logo.width}x${logo.height} is not a usable size`);
    // A pixel floor only means something for raster art. An SVG scales
    // losslessly, so its viewBox numbers say nothing about display quality.
    if (!logo.file.endsWith('.svg')) {
      assert.ok(logo.width >= 100 && logo.height >= 100, `${id}: ${logo.width}x${logo.height} is too small to display`);
    }
    assert.ok(logo.sourceUrl.startsWith('https://'), `${id}: provenance URL is not https`);
    // A personal account's avatar pictures a person, not a project. Three
    // records are deliberately empty for exactly this reason, so no record may
    // quietly reintroduce one.
    assert.ok(
      !(logo.sourceKind === 'owner-avatar' && logo.ownerType === 'user'),
      `${id}: a personal account avatar is being used as a project logo`
    );
  }
  assert.equal(withLogo, 38, `expected 38 projects with a logo, found ${withLogo}`);
});

test('no shipped project SVG can execute script if opened directly', async () => {
  const { readdirSync, readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  // These files come from third parties and are served from /images/ without a
  // CSP, so a scriptable SVG navigated to directly would run in this origin.
  // An <img> never executes it, but a pasted link would.
  const dir = fileURLToPath(new URL('../public/images/projects/', import.meta.url));
  const svgs = readdirSync(dir).filter(file => file.endsWith('.svg'));
  assert.ok(svgs.length > 5, `expected several SVG logos, found ${svgs.length}`);
  const dangerous = /<script|<foreignObject|<iframe|\son[a-z]+\s*=|javascript:|<!ENTITY/i;
  for (const file of svgs) {
    const body = readFileSync(dir + file, 'utf8');
    const hit = dangerous.exec(body);
    assert.equal(hit, null, `${file} contains ${hit?.[0]}, which must be stripped before shipping`);
  }
});
