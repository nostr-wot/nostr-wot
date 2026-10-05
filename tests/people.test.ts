import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import type { EcosystemData } from '../lib/ecosystem-projects';
import {
  getPeople,
  getPerson,
  peopleCopy,
  personCrumbs,
  personDescription,
  personJsonLd,
  personSlug,
  personTitle,
  roleLabel,
} from '../lib/people';

const locales = ['en', 'es', 'pt', 'ru', 'it', 'fr', 'de'];

function dataFor(locale: string): EcosystemData {
  const file = locale === 'en' ? 'ecosystem-projects.json' : `ecosystem-projects.${locale}.json`;
  return JSON.parse(readFileSync(new URL(`../data/${file}`, import.meta.url), 'utf8'));
}

test('personSlug kebab-cases a name and is stable across scripts and case', () => {
  assert.equal(personSlug('William Casarin'), 'william-casarin');
  assert.equal(personSlug('Vitor Pamplona'), 'vitor-pamplona');
  assert.equal(personSlug('hodlbod'), 'hodlbod');
  assert.equal(personSlug('greenart7c3'), 'greenart7c3');
  assert.equal(personSlug('Fabian'), 'fabian');
  // Marks are stripped after NFD, so an accented Latin name slugs to ASCII.
  assert.equal(personSlug('José Ángel Núñez'), 'jose-angel-nunez');
  // Punctuation and runs of separators collapse to one hyphen, with none left
  // at either end: a slug is what goes in a URL path segment.
  assert.equal(personSlug("  O'Brien   (jr.) "), 'o-brien-jr');
  // A non-Latin name keeps its letters rather than slugging to nothing, which
  // would make two such people collide on the empty slug.
  assert.equal(personSlug('Пётр Иванов'), 'петр-иванов');
});

test('credited people are derived from the dataset, each with the role that evidences them', () => {
  const people = getPeople(dataFor('en'));
  // Not a pinned list of names: people are added as evidence is found, so this
  // asserts the properties that must always hold instead of a snapshot that
  // would need editing on every addition.
  assert.ok(people.length > 0, 'no people were derived from the dataset');
  for (const person of people) {
    assert.match(person.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${person.name}: slug is not url-safe`);
    assert.ok(person.name.trim(), 'a person has no name');
    assert.ok(person.roles.length > 0, `${person.slug}: derived with no role`);
    for (const role of person.roles) {
      assert.ok(['founder', 'maintainer', 'creator'].includes(role.role), `${person.slug}: role ${role.role}`);
      assert.ok(role.projectId && role.projectName, `${person.slug}: role is not tied to a project`);
      assert.ok(role.sourceUrl.startsWith('https://'), `${person.slug}: role evidence is not https`);
      assert.ok(role.profiles.length > 0, `${person.slug}: role carries no profile link`);
    }
  }
  // Distinct slugs: grouping is by slug, so a collision would silently merge
  // two different people onto one page.
  assert.equal(new Set(people.map(person => person.slug)).size, people.length);
  // One person credited on several projects must be one page with several
  // roles, not several pages.
  const fiatjaf = getPerson(dataFor('en'), 'fiatjaf');
  assert.ok((fiatjaf?.roles.length ?? 0) > 1, 'a person credited on several projects did not group');

  const casarin = getPerson(dataFor('en'), 'william-casarin');
  assert.equal(casarin?.name, 'William Casarin');
  assert.deepEqual(casarin?.roles.map(role => [role.projectId, role.projectName, role.role]),
    [['damus', 'Damus', 'founder']]);
  assert.equal(casarin?.roles[0].sourceUrl, 'https://damus.io/');
  assert.deepEqual(casarin?.roles[0].profiles.map(profile => profile.url),
    ['https://github.com/jb55', 'https://x.com/jb55']);

  assert.equal(getPerson(dataFor('en'), 'nobody'), undefined);
  // The slug is what the route resolves, so a name-cased lookup is a miss.
  assert.equal(getPerson(dataFor('en'), 'William Casarin'), undefined);
});

test('every locale derives the same people, since names are not translated', () => {
  const english = getPeople(dataFor('en'));
  for (const locale of locales.slice(1)) {
    const people = getPeople(dataFor(locale));
    assert.deepEqual(people.map(person => person.slug), english.map(person => person.slug), locale);
    assert.deepEqual(people.map(person => person.name), english.map(person => person.name), locale);
    // Project names are not translated either, so a description composed in
    // any locale names the same project.
    assert.deepEqual(
      people.flatMap(person => person.roles.map(role => role.projectName)),
      english.flatMap(person => person.roles.map(role => role.projectName)),
      locale,
    );
  }
});

test('a person credited on two projects gets one record carrying both roles', () => {
  // None of the five currently does, so this is the case the derivation has to
  // be correct about rather than a case the dataset proves.
  const data = {
    checkedAt: '2026-10-04',
    news: [], security: [],
    projects: [
      { id: 'first', name: 'First', summary: 's', category: 'tools', status: 'active' as const,
        statusNote: 'n', website: 'https://example.com', repository: 'https://github.com/a/first',
        lastVerified: '2026-10-04', sources: [],
        people: [{ name: 'Ada Lovelace', role: 'founder' as const, profiles: [{ label: 'GitHub', url: 'https://github.com/ada' }], sourceUrl: 'https://example.com/first' }] },
      { id: 'second', name: 'Second', summary: 's', category: 'tools', status: 'active' as const,
        statusNote: 'n', website: 'https://example.com', repository: 'https://github.com/a/second',
        lastVerified: '2026-10-04', sources: [],
        people: [{ name: 'Ada Lovelace', role: 'maintainer' as const, profiles: [], sourceUrl: 'https://example.com/second' }] },
    ],
  };
  const people = getPeople(data);
  assert.equal(people.length, 1);
  assert.deepEqual(people[0].roles.map(role => [role.projectId, role.role]),
    [['first', 'founder'], ['second', 'maintainer']]);
  // Both roles reach the graph's sameAs, deduplicated, and a role with no
  // profiles contributes nothing rather than an empty entry.
  const [graph] = personJsonLd({ person: people[0], url: 'https://nostrwot.com/people/ada-lovelace', locale: 'en' });
  assert.deepEqual((graph as { sameAs: string[] }).sameAs, ['https://github.com/ada']);
});

test('a role with no usable source URL creates no person page', () => {
  const base = {
    checkedAt: '2026-10-04', news: [], security: [],
    projects: [
      { id: 'p', name: 'P', summary: 's', category: 'tools', status: 'active' as const,
        statusNote: 'n', website: 'https://example.com', repository: 'https://github.com/a/p',
        lastVerified: '2026-10-04', sources: [],
        people: [{ name: 'Unevidenced Person', role: 'founder' as const, profiles: [], sourceUrl: '' }] },
    ],
  };
  // A person page IS a citation, so an uncited role must not bring one into
  // existence. This is the same filter the project page applies before it
  // lists a person at all.
  for (const sourceUrl of ['', 'javascript:alert(1)', '/relative', 'https://user:pass@example.com/x']) {
    base.projects[0].people[0].sourceUrl = sourceUrl;
    assert.deepEqual(getPeople(base), [], sourceUrl);
  }
  base.projects[0].people[0].sourceUrl = 'https://example.com/evidence';
  assert.equal(getPeople(base).length, 1);
});

test('every person composes a title and description inside the policy window', async () => {
  const { SEO_LIMITS } = await import('../lib/metadata-policy');
  const [titleMin, titleMax] = SEO_LIMITS.title;
  const [descriptionMin, descriptionMax] = SEO_LIMITS.description;

  for (const locale of locales) {
    for (const person of getPeople(dataFor(locale))) {
      const title = personTitle(person, locale);
      const titleLength = Array.from(title).length;
      assert.ok(titleLength >= titleMin && titleLength <= titleMax,
        `${locale}/${person.slug}: title is ${titleLength} chars: ${title}`);

      const description = personDescription(person, locale);
      const descriptionLength = Array.from(description).length;
      // Both bounds, not just the upper one: under the lower bound
      // `withMetadataPolicy` pads with generic site filler, which is exactly
      // what composing the copy here is meant to avoid.
      assert.ok(descriptionLength >= descriptionMin && descriptionLength <= descriptionMax,
        `${locale}/${person.slug}: description is ${descriptionLength} chars: ${description}`);
      assert.ok(description.includes(person.name), `${locale}/${person.slug}: name missing`);
      if (person.roles.length === 1) {
        assert.ok(description.includes(person.roles[0].projectName), `${locale}/${person.slug}: project missing`);
      } else {
        // A description that names one of several projects reads as if every
        // credited role were on it: fiatjaf holds six, and the old copy put
        // them all "on nos2x". The plural template states the count and names
        // no project, because the page lists all of them in full.
        assert.ok(description.includes(String(person.roles.length)),
          `${locale}/${person.slug}: role count missing from the plural description: ${description}`);
        for (const role of person.roles) {
          assert.ok(!description.includes(role.projectName),
            `${locale}/${person.slug}: plural description names ${role.projectName} as if it were the only project: ${description}`);
        }
      }
      // The policy never sees copy it would have to cut, so no composed
      // description ends mid-sentence.
      assert.doesNotMatch(description, /…$/, `${locale}/${person.slug}: truncated`);
    }
  }
});

test('composed copy carries no em dash in any locale', () => {
  for (const locale of locales) {
    const copy = peopleCopy(locale);
    for (const person of getPeople(dataFor(locale))) {
      assert.doesNotMatch(personTitle(person, locale), /—/, `${locale}/${person.slug}`);
      assert.doesNotMatch(personDescription(person, locale), /—/, `${locale}/${person.slug}`);
    }
    assert.doesNotMatch(JSON.stringify(copy), /—/, locale);
  }
});

test('peopleCopy falls back per locale, and roleLabel reuses the directory labels', () => {
  assert.equal(peopleCopy('xx').breadcrumbPeople, peopleCopy('en').breadcrumbPeople);
  assert.equal(peopleCopy('de').breadcrumbPeople, 'Personen im Verzeichnis');
  assert.equal(roleLabel('founder', 'en'), 'founder');
  assert.equal(roleLabel('maintainer', 'de'), 'Betreuer');
  // An unknown role is echoed rather than rendering undefined.
  assert.equal(roleLabel('archivist', 'en'), 'archivist');
});

test('the Person graph states only what the dataset evidences', () => {
  const person = getPerson(dataFor('en'), 'vitor-pamplona')!;
  const url = 'https://nostrwot.com/people/vitor-pamplona';
  const graphs = personJsonLd({ person, url, locale: 'en' });
  const graph = graphs[0] as Record<string, unknown>;
  const breadcrumbs = graphs[1] as unknown as { itemListElement: { position: number; name: string; item: string }[] };

  assert.deepEqual(Object.keys(graph).sort(), ['@context', '@type', 'name', 'sameAs', 'url']);
  assert.equal(graph['@type'], 'Person');
  assert.equal(graph.name, 'Vitor Pamplona');
  assert.equal(graph.url, url);
  assert.deepEqual(graph.sameAs, person.roles[0].profiles.map(profile => profile.url));
  // Nothing invented: no employment, no image, no dates, no location.
  for (const key of ['jobTitle', 'worksFor', 'affiliation', 'image', 'birthDate', 'address', 'knowsAbout']) {
    assert.ok(!(key in graph), key);
  }

  // Four levels, and the people crumb points at the people index. It used to
  // be named "People in the directory" while pointing at /projects, because no
  // such index existed; now it does, and the name matches the destination.
  assert.deepEqual(breadcrumbs.itemListElement.map(crumb => [crumb.position, crumb.name, crumb.item]), [
    [1, 'Nostr WoT', 'https://nostrwot.com'],
    [2, 'Projects', 'https://nostrwot.com/projects'],
    [3, 'People in the directory', 'https://nostrwot.com/people'],
    [4, 'Vitor Pamplona', url],
  ]);

  const german = personJsonLd({ person, url, locale: 'de' })[1] as {
    itemListElement: { item: string }[];
  };
  // Every crumb, including the last, is derived from the locale, so the trail
  // cannot mix a German path with an English one. This used to echo whatever
  // `url` the caller passed, which let the two disagree.
  assert.deepEqual(german.itemListElement.map(crumb => crumb.item), [
    'https://nostrwot.com/de', 'https://nostrwot.com/de/projects',
    'https://nostrwot.com/de/people', 'https://nostrwot.com/de/people/vitor-pamplona',
  ]);

  // The graph and the rendered trail are built from one list, so a change to
  // either shows up here.
  assert.deepEqual(
    personCrumbs(person, 'en').map(crumb => crumb.name),
    breadcrumbs.itemListElement.map(crumb => crumb.name));
});

test('an unsafe profile URL is kept out of sameAs, and sameAs is omitted when nothing is left', () => {
  const person = {
    slug: 'test-person', name: 'Test Person',
    roles: [{
      projectId: 'p', projectName: 'P', role: 'founder' as const,
      sourceUrl: 'https://example.com/evidence',
      profiles: [{ label: 'bad', url: 'javascript:alert(1)' }, { label: 'relative', url: '/x' }],
    }],
  };
  const [graph] = personJsonLd({ person, url: 'https://nostrwot.com/people/test-person', locale: 'en' });
  assert.ok(!('sameAs' in graph));
  person.roles[0].profiles.push({ label: 'GitHub', url: 'https://github.com/test' });
  const [withProfile] = personJsonLd({ person, url: 'https://nostrwot.com/people/test-person', locale: 'en' });
  assert.deepEqual((withProfile as { sameAs: string[] }).sameAs, ['https://github.com/test']);
});

test('PersonDetail renders the role, the project link and the evidence, and nothing more', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { default: PersonDetail } = await import('../components/people/PersonDetail');
  const person = getPerson(dataFor('en'), 'greenart7c3')!;

  const html = renderToStaticMarkup(createElement(PersonDetail, { person, locale: 'en', pathPrefix: '' }));
  assert.match(html, /<h1[^>]*>greenart7c3<\/h1>/);
  assert.match(html, /maintainer/);
  assert.match(html, /href="\/projects\/amber"/);
  assert.match(html, /href="\/projects"/);
  // Outbound links go through the shared ExternalLink, so they carry the
  // site's new-tab and rel policy rather than a second implementation of it.
  assert.match(html, /href="https:\/\/github\.com\/greenart7c3\/greenart7c3\.com\/blob\/master\/index\.html"[^>]*rel="nofollow noopener"/);
  assert.match(html, /href="https:\/\/github\.com\/greenart7c3"[^>]*rel="nofollow noopener"/);
  // The parenthetical that explains a profile link becomes its tooltip, as on
  // the project page, rather than being dropped or inlined twice.
  assert.match(html, /linked by official GitHub profile/);
  assert.doesNotMatch(html, /Nostr \(linked by official GitHub profile\)/);

  const german = renderToStaticMarkup(createElement(PersonDetail, { person, locale: 'de', pathPrefix: '/de' }));
  // The breadcrumb replaced the lone back link, so the German check is that the
  // trail itself is translated and points at the German paths.
  assert.match(german, /aria-label="Brotkrümelnavigation"/);
  assert.match(german, /href="\/de\/projects"[^>]*>Projekte</);
  assert.match(german, /href="\/de\/people"[^>]*>Personen im Verzeichnis</);
  assert.match(german, /href="\/de\/projects\/amber"/);
  assert.match(german, /Betreuer/);
});

test('a role with no recorded profiles says so rather than rendering an empty list', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { default: PersonDetail } = await import('../components/people/PersonDetail');
  const person = {
    slug: 'test-person', name: 'Test Person',
    roles: [{ projectId: 'p', projectName: 'P', role: 'creator' as const, profiles: [], sourceUrl: 'https://example.com/evidence' }],
  };
  const html = renderToStaticMarkup(createElement(PersonDetail, { person, locale: 'en', pathPrefix: '' }));
  assert.match(html, /No profile links are recorded for this role\./);
  assert.doesNotMatch(html, /<ul[^>]*>\s*<\/ul>/);
});

test('an unsafe evidence URL degrades to plain text instead of rendering a link', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { default: PersonDetail } = await import('../components/people/PersonDetail');
  // getPeople never yields such a role, so this pins the component's own
  // behaviour if it is ever rendered with one.
  const person = {
    slug: 'test-person', name: 'Test Person',
    roles: [{
      projectId: 'p', projectName: 'P', role: 'creator' as const,
      profiles: [{ label: 'Site', url: 'javascript:alert(1)' }], sourceUrl: '/relative',
    }],
  };
  const html = renderToStaticMarkup(createElement(PersonDetail, { person, locale: 'en', pathPrefix: '' }));
  assert.doesNotMatch(html, /javascript:/);
  assert.doesNotMatch(html, /href="\/relative"/);
  assert.match(html, /link unavailable/);
});

test('people.json is registered as a namespace and present in all seven locales', async () => {
  const messages = (await import('../messages/en/index')).default as Record<string, unknown>;
  assert.ok('people' in messages, 'people namespace is not registered in messages/en/index.ts');
  assert.deepEqual(messages.people, peopleCopy('en'));
  for (const locale of locales) {
    const copy = peopleCopy(locale);
    assert.equal(copy.titleTemplates.length, peopleCopy('en').titleTemplates.length, locale);
    assert.equal(copy.descriptionTemplates.length, peopleCopy('en').descriptionTemplates.length, locale);
    assert.equal(copy.descriptionSuffixes.length, peopleCopy('en').descriptionSuffixes.length, locale);
  }
});
